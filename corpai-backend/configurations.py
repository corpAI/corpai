from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import boto3
import os
from boto3.dynamodb.conditions import Key

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
            KeyConditionExpression=Key('configuration_head').eq(current_user)
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
            config_data.update({
                's3Bucket': data.get('s3Bucket'),
                'region': data.get('region'),
                'accessKeyId': data.get('accessKeyId'),
                'secretAccessKey': data.get('secretAccessKey')
            })
        elif provider == 'gcp':
            config_data.update({
                'gcpProjectId': data.get('gcpProjectId'),
                'gcpCredentials': data.get('gcpCredentials')
            })
        elif provider == 'onedrive':
            config_data.update({
                'oneDriveClientId': data.get('oneDriveClientId'),
                'oneDriveClientSecret': data.get('oneDriveClientSecret')
            })
        elif provider == 'box':
            config_data.update({
                'boxClientId': data.get('boxClientId'),
                'boxClientSecret': data.get('boxClientSecret')
            })
        elif provider == 'dropbox':
            config_data.update({
                'dropboxAccessToken': data.get('dropboxAccessToken')
            })
        else:
            return jsonify({"error": "Unsupported provider type"}), 400

        # Validate required fields
        if not all(config_data.values()):
            return jsonify({"error": "Missing required fields"}), 400

        # Save the new configuration to DynamoDB
        table.put_item(Item=config_data)
        return jsonify({"message": "Configuration added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        return jsonify({"error": str(e)}), 500

# Delete a configuration for the logged-in user
@configurations_bp.route('/configurations/<string:provider>/<string:config_name>', methods=['DELETE'])
@jwt_required()
def delete_configuration(provider, config_name):
    try:
        # Get the current user's email/ID from the JWT token
        current_user = get_jwt_identity()
        config_identifier = f"{provider}#{config_name}"

        # Delete the configuration from DynamoDB
        table.delete_item(
            Key={
                'configuration_head': current_user,
                'config_identifier': config_identifier
            }
        )

        return jsonify({"message": "Configuration deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
