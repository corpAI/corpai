
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import boto3
import os
from boto3.dynamodb.conditions import Key

# Initialize Flask blueprint for configurations
configurations_bp = Blueprint('configurations_bp', __name__)

def get_dynamodb_resource():
   return boto3.resource(
        'dynamodb',
        region_name=os.getenv('CORPAI_AWS_REGION'),
        aws_access_key_id=os.getenv('CORPAI_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('CORPAI_AWS_SECRET_ACCESS_KEY'),
    )

# Table name where configurations will be stored
table_name = 'Configurations'

# Get all configurations for the logged-in user
@configurations_bp.route('/configurations', methods=['GET'])
@jwt_required()
def get_configurations():
    try:
        # Get the current user's identity from the JWT token
        current_user = get_jwt_identity()
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table(table_name)
        
        # Query the DynamoDB table for this user's configurations
        response = table.query(
            KeyConditionExpression=Key('configuration_head').eq(current_user)
        )
        
        configurations = response.get('Items', [])
        return jsonify(configurations), 200
    
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Add a new configuration for the logged-in user
@configurations_bp.route('/configurations', methods=['POST'])
@jwt_required()
def add_configuration():
    try:
        # Get the current user's identity from the JWT token
        current_user = get_jwt_identity()
        data = request.get_json()
        provider = data.get('provider')
        config_name = data.get('config_name')  # Unique name for each configuration

        # Ensure all required fields are provided
        if not provider or not config_name:
            return jsonify({"error": "Missing provider or config_name"}), 400

        # Create the composite key value for the sort key
        config_identifier = f"{provider}#{config_name}"  # Composite Sort Key

        config_data = {
            'configuration_head': current_user,  # Partition Key
            'config_identifier': config_identifier,  # Sort Key
            'provider': provider,
            'config_name': config_name  # Store config_name for easier retrieval
        }

        # Add provider-specific configuration data
        if provider == 's3':
            required_fields = ['s3Bucket', 'region', 'dataSourceName']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields for S3 provider"}), 400

            config_data.update({
                's3Bucket': data.get('s3Bucket'),
                'region': data.get('region'),
                'dataSourceName': data.get('dataSourceName'),
                'knowledgeBaseId': data.get('knowledgeBaseId'),
                'knowledgeBaseName': data.get('knowledgeBaseName'),
                'accessKeyId': data.get('accessKeyId'),
                'secretAccessKey': data.get('secretAccessKey')
            })
        elif provider == 'gcp':
            required_fields = ['gcpProjectId', 'gcpCredentials']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields for GCP provider"}), 400

            config_data.update({
                'gcpProjectId': data.get('gcpProjectId'),
                'gcpCredentials': data.get('gcpCredentials')
            })
        elif provider == 'onedrive':
            required_fields = ['oneDriveClientId', 'oneDriveClientSecret']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields for OneDrive provider"}), 400

            config_data.update({
                'oneDriveClientId': data.get('oneDriveClientId'),
                'oneDriveClientSecret': data.get('oneDriveClientSecret')
            })
        elif provider == 'box':
            required_fields = ['boxClientId', 'boxClientSecret']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields for Box provider"}), 400

            config_data.update({
                'boxClientId': data.get('boxClientId'),
                'boxClientSecret': data.get('boxClientSecret')
            })
        elif provider == 'dropbox':
            required_fields = ['dropboxAccessToken']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields for Dropbox provider"}), 400

            config_data.update({
                'dropboxAccessToken': data.get('dropboxAccessToken')
            })
        else:
            return jsonify({"error": "Unsupported provider type"}), 400

        # Save the new configuration to DynamoDB
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table(table_name)
        table.put_item(Item=config_data)
        return jsonify({"message": "Configuration added successfully"}), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Update a configuration for the logged-in user
@configurations_bp.route('/configurations/<string:provider>/<string:config_name>', methods=['PUT'])
@jwt_required()
def update_configuration(provider, config_name):
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        config_identifier = f"{provider}#{config_name}"

        # Prepare the update expression
        update_expression = "SET "
        expression_attribute_values = {}
        expression_attribute_names = {}
        for key, value in data.items():
            if key in ['configuration_head', 'config_identifier']:
                continue
            update_expression += f"#{key} = :{key}, "
            expression_attribute_values[f":{key}"] = value
            expression_attribute_names[f"#{key}"] = key

        update_expression = update_expression.rstrip(', ')

        # Update the item in DynamoDB
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table(table_name)
        table.update_item(
            Key={
                'configuration_head': current_user,
                'config_identifier': config_identifier
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names
        )

        return jsonify({"message": "Configuration updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

# Delete a configuration for the logged-in user
@configurations_bp.route('/configurations/<string:provider>/<string:config_name>', methods=['DELETE'])
@jwt_required()
def delete_configuration(provider, config_name):
    try:
        # Get the current user's identity from the JWT token
        current_user = get_jwt_identity()
        config_identifier = f"{provider}#{config_name}"

        # Delete the configuration from DynamoDB
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table(table_name)
        table.delete_item(
            Key={
                'configuration_head': current_user,
                'config_identifier': config_identifier
            }
        )

        return jsonify({"message": "Configuration deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

def get_s3_config(data_source_name, current_user):
    """
    Retrieves the S3 configuration details from DynamoDB based on the data_source_name.

    :param data_source_name: The name of the data source.
    :param current_user: The current user's identity.
    :return: Dictionary containing the configuration details.
    """
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table(table_name)

    try:
        response = table.get_item(
            Key={
                'configuration_head': current_user,
                'config_identifier': f's3#{data_source_name}'
            }
        )

        if 'Item' not in response:
            return None

        item = response['Item']
        return item

    except Exception as e:
        print(f"Error fetching configuration from DynamoDB: {str(e)}")
        return None
