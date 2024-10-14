from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from configurations import get_s3_config
import boto3
import os
import json

bedrock_bp = Blueprint('bedrock_bp', __name__)

@bedrock_bp.route('/create_data_source', methods=['POST'])
@jwt_required()
def create_data_source():
    data = request.json
    current_user = get_jwt_identity()

    required_fields = ['s3Bucket', 'region', 'dataSourceName']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields."}), 400

    s3_bucket = data['s3Bucket']
    region = data['region']
    data_source_name = data['dataSourceName']
    access_key_id = data.get('accessKeyId')
    secret_access_key = data.get('secretAccessKey')

    # Use IAM Role if access keys are not provided
    if access_key_id and secret_access_key:
        session = boto3.Session(
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region
        )
    else:
        session = boto3.Session(region_name=region)

    s3_client = session.client('s3')
    bedrock_client = session.client('bedrock')

    # Check S3 bucket access
    try:
        s3_client.head_bucket(Bucket=s3_bucket)
    except s3_client.exceptions.ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '403':
            return jsonify({"error": f"Access denied to bucket {s3_bucket}."}), 403
        elif error_code == '404':
            return jsonify({"error": f"Bucket {s3_bucket} not found."}), 404
        else:
            return jsonify({"error": f"Error accessing bucket: {str(e)}"}), 500

    # Create Bedrock data source
    try:
        bedrock_client.create_data_source(
            name=data_source_name,
            type='S3',
            configuration={
                's3Configuration': {
                    'bucketName': s3_bucket,
                    'bucketPrefix': ''
                }
            }
        )
    except Exception as e:
        return jsonify({"error": f"Error creating data source: {str(e)}"}), 500

    # Create Knowledge Base
    knowledge_base_name = data.get('knowledgeBaseName', f"{data_source_name}_kb")
    try:
        response = bedrock_client.create_knowledge_base(
            name=knowledge_base_name,
            type='CUSTOM',
            description=f"Knowledge base for {data_source_name}",
            sourceConfigs=[
                {
                    'dataSourceName': data_source_name
                }
            ]
        )
        knowledge_base_id = response['knowledgeBaseId']
    except Exception as e:
        return jsonify({"error": f"Error creating knowledge base: {str(e)}"}), 500

    # Store configuration
    config_item = {
        'configuration_head': current_user,
        'config_identifier': f's3#{data_source_name}',
        'provider': 's3',
        'config_name': data_source_name,
        's3Bucket': s3_bucket,
        'region': region,
        'dataSourceName': data_source_name,
        'knowledgeBaseId': knowledge_base_id,
        'knowledgeBaseName': knowledge_base_name,
        'accessKeyId': access_key_id,
        'secretAccessKey': secret_access_key
    }

    # Save to DynamoDB
    dynamodb = session.resource('dynamodb')
    table = dynamodb.Table('Configurations')
    try:
        table.put_item(Item=config_item)
    except Exception as e:
        return jsonify({"error": f"Error saving configuration: {str(e)}"}), 500

    # Set up synchronization
    setup_synchronization(data_source_name, s3_bucket, region, session)

    # Set up ingestion job scheduler
    setup_ingestion_job_scheduler(data_source_name, knowledge_base_id, region, session)

    return jsonify({"message": "Data source and knowledge base created successfully."}), 201

def setup_synchronization(data_source_name, s3_bucket, region, session):
    lambda_client = session.client('lambda')
    eventbridge_client = session.client('events')

    lambda_function_name = f'sync_{data_source_name}_lambda'
    lambda_role_arn = os.getenv('LAMBDA_ROLE_ARN')

    # Lambda function code
    lambda_code = f"""
import boto3

def lambda_handler(event, context):
    bedrock_client = boto3.client('bedrock', region_name='{region}')
    try:
        bedrock_client.update_data_source(name='{data_source_name}')
        print('Data source synchronized.')
    except Exception as e:
        print(f'Error synchronizing data source: {{str(e)}}')
"""

    # Create or update Lambda function
    try:
        lambda_client.get_function(FunctionName=lambda_function_name)
        # Update code
        lambda_client.update_function_code(
            FunctionName=lambda_function_name,
            ZipFile=create_lambda_zip(lambda_code)
        )
    except lambda_client.exceptions.ResourceNotFoundException:
        # Create function
        lambda_client.create_function(
            FunctionName=lambda_function_name,
            Runtime='python3.9',
            Role=lambda_role_arn,
            Handler='lambda_function.lambda_handler',
            Code={
                'ZipFile': create_lambda_zip(lambda_code)
            },
            Timeout=15,
            MemorySize=128
        )

    # Add permission
    lambda_client.add_permission(
        FunctionName=lambda_function_name,
        StatementId='AllowEventBridgeInvoke',
        Action='lambda:InvokeFunction',
        Principal='events.amazonaws.com',
        SourceArn=f'arn:aws:events:{region}:{os.getenv("AWS_ACCOUNT_ID")}:rule/{data_source_name}_sync_rule'
    )

    # Create EventBridge rule
    event_pattern = {
        "source": ["aws.s3"],
        "detail-type": ["Object Created", "Object Removed"],
        "resources": [f"arn:aws:s3:::{s3_bucket}"]
    }

    eventbridge_client.put_rule(
        Name=f'{data_source_name}_sync_rule',
        EventPattern=json.dumps(event_pattern),
        State='ENABLED'
    )

    # Add target
    eventbridge_client.put_targets(
        Rule=f'{data_source_name}_sync_rule',
        Targets=[
            {
                'Id': '1',
                'Arn': f'arn:aws:lambda:{region}:{os.getenv("AWS_ACCOUNT_ID")}:function:{lambda_function_name}'
            }
        ]
    )

def setup_ingestion_job_scheduler(data_source_name, knowledge_base_id, region, session):
    lambda_client = session.client('lambda')
    eventbridge_client = session.client('events')

    lambda_function_name = f'ingest_{data_source_name}_lambda'
    lambda_role_arn = os.getenv('LAMBDA_ROLE_ARN')

    # Lambda function code
    lambda_code = f"""
import boto3

def lambda_handler(event, context):
    bedrock_client = boto3.client('bedrock', region_name='{region}')
    try:
        response = bedrock_client.start_ingestion_job(
            knowledgeBaseId='{knowledge_base_id}'
        )
        print('Ingestion job started:', response['ingestionJobId'])
    except Exception as e:
        print(f'Error starting ingestion job: {{str(e)}}')
"""

    # Create or update Lambda function
    try:
        lambda_client.get_function(FunctionName=lambda_function_name)
        # Update code
        lambda_client.update_function_code(
            FunctionName=lambda_function_name,
            ZipFile=create_lambda_zip(lambda_code)
        )
    except lambda_client.exceptions.ResourceNotFoundException:
        # Create function
        lambda_client.create_function(
            FunctionName=lambda_function_name,
            Runtime='python3.9',
            Role=lambda_role_arn,
            Handler='lambda_function.lambda_handler',
            Code={
                'ZipFile': create_lambda_zip(lambda_code)
            },
            Timeout=15,
            MemorySize=128
        )

    # Add permission
    lambda_client.add_permission(
        FunctionName=lambda_function_name,
        StatementId='AllowEventBridgeInvokeIngestion',
        Action='lambda:InvokeFunction',
        Principal='events.amazonaws.com',
        SourceArn=f'arn:aws:events:{region}:{os.getenv("AWS_ACCOUNT_ID")}:rule/{data_source_name}_ingestion_rule'
    )

    # Create EventBridge scheduled rule
    schedule_expression = 'cron(0 0,12 * * ? *)'  # At 00:00 and 12:00 UTC every day

    eventbridge_client.put_rule(
        Name=f'{data_source_name}_ingestion_rule',
        ScheduleExpression=schedule_expression,
        State='ENABLED'
    )

    # Add target
    eventbridge_client.put_targets(
        Rule=f'{data_source_name}_ingestion_rule',
        Targets=[
            {
                'Id': '1',
                'Arn': f'arn:aws:lambda:{region}:{os.getenv("AWS_ACCOUNT_ID")}:function:{lambda_function_name}'
            }
        ]
    )

def create_lambda_zip(lambda_code):
    import zipfile
    import io

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('lambda_function.py', lambda_code)
    zip_buffer.seek(0)
    return zip_buffer.read()

@bedrock_bp.route('/start_ingestion_job', methods=['POST'])
@jwt_required()
def start_ingestion_job():
    data = request.json
    data_source_name = data.get('dataSourceName')
    current_user = get_jwt_identity()

    if not data_source_name:
        return jsonify({"error": "dataSourceName is required."}), 400

    # Get the configuration
    config = get_s3_config(data_source_name, current_user)
    if not config:
        return jsonify({"error": "Data source configuration not found."}), 404

    region = config['region']
    access_key_id = config.get('accessKeyId')
    secret_access_key = config.get('secretAccessKey')
    knowledge_base_id = config.get('knowledgeBaseId')

    if not knowledge_base_id:
        return jsonify({"error": "Knowledge base ID not found in configuration."}), 500

    # Use IAM Role if access keys are not provided
    if access_key_id and secret_access_key:
        session = boto3.Session(
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region
        )
    else:
        session = boto3.Session(region_name=region)

    bedrock_client = session.client('bedrock')

    # Start ingestion job
    try:
        response = bedrock_client.start_ingestion_job(
            knowledgeBaseId=knowledge_base_id
        )
        ingestion_job_id = response['ingestionJobId']
        return jsonify({"message": "Ingestion job started successfully.", "ingestionJobId": ingestion_job_id}), 200
    except Exception as e:
        return jsonify({"error": f"Error starting ingestion job: {str(e)}"}), 500

@bedrock_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    data = request.json
    user_message = data.get('message')
    data_source_name = data.get('dataSourceName')
    current_user = get_jwt_identity()

    if not user_message or not data_source_name:
        return jsonify({"error": "Message and dataSourceName are required."}), 400

    config = get_s3_config(data_source_name, current_user)
    if not config:
        return jsonify({"error": "Data source configuration not found."}), 404

    knowledge_base_id = config.get('knowledgeBaseId')
    if not knowledge_base_id:
        return jsonify({"error": "Knowledge base ID not found in configuration."}), 500

    region = config['region']
    access_key_id = config.get('accessKeyId')
    secret_access_key = config.get('secretAccessKey')

    # Use IAM Role if access keys are not provided
    if access_key_id and secret_access_key:
        session = boto3.Session(
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region
        )
    else:
        session = boto3.Session(region_name=region)

    bedrock_runtime_client = session.client('bedrock-runtime')

    response, error = chat_with_bedrock(bedrock_runtime_client, user_message, knowledge_base_id)
    if error:
        return jsonify({"error": error}), 500

    return jsonify({"response": response}), 200

def chat_with_bedrock(bedrock_runtime_client, user_message, knowledge_base_id):
    try:
        payload = {
            "inputText": user_message,
            "knowledgeBaseId": knowledge_base_id
        }

        response = bedrock_runtime_client.invoke_model(
            modelId='anthropic.claude-v2',  # Replace with your model ID
            contentType='application/json',
            accept='application/json',
            body=json.dumps(payload)
        )

        response_body = response['body'].read()
        result = json.loads(response_body)
        return result.get('outputText', 'No response.'), None

    except Exception as e:
        return None, f"Error invoking model: {str(e)}"
