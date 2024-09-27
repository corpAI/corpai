from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import boto3
import os

# Initialize Flask blueprint for configurations
configurations_bp = Blueprint('configurations', __name__)

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION'))

# Table name where configurations will be stored
table_name = 'Configurations'
table = dynamodb.Table(table_name)

# Get all configurations for the logged-in user
@configurations_bp.route('/configurations', methods=['GET'])
@jwt_required()
def get_configurations():
    try:
        # Get the current user's email/ID from the JWT token
        current_user = get_jwt_identity()
        
        # Query the DynamoDB table for this user's configurations
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('configuration_head').eq(current_user)
        )
        
        configurations = response.get('Items', [])
        return jsonify(configurations), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a new configuration for the logged-in user
@configurations_bp.route('/configurations', methods=['POST'])
@jwt_required()
def add_configuration():
    try:
        # Get the current user's email/ID from the JWT token
        current_user = get_jwt_identity()

        # Get the configuration details from the request body
        data = request.get_json()
        s3_bucket = data.get('s3Bucket')
        region = data.get('region')
        access_key_id = data.get('accessKeyId')
        secret_access_key = data.get('secretAccessKey')

        if not all([s3_bucket, region, access_key_id, secret_access_key]):
            return jsonify({"error": "Missing required fields"}), 400

        # Save the new configuration to DynamoDB
        table.put_item(
            Item={
                'configuration_head': current_user,            # User ID (from JWT token)
                's3Bucket': s3_bucket,
                'region': region,
                'accessKeyId': access_key_id,
                'secretAccessKey': secret_access_key
            }
        )
        return jsonify({"message": "Configuration added successfully"}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete a configuration for the logged-in user
@configurations_bp.route('/configurations/<string:s3_bucket>', methods=['DELETE'])
@jwt_required()
def delete_configuration(s3_bucket):
    try:
        # Get the current user's email/ID from the JWT token
        current_user = get_jwt_identity()

        # Delete the configuration from DynamoDB
        table.delete_item(
            Key={
                'user_id': current_user,
                's3Bucket': s3_bucket
            }
        )
        return jsonify({"message": "Configuration deleted successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
