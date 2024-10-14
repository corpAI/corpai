from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import hashlib
import boto3
from google.oauth2 import id_token
from google.auth.transport import requests
import os

auth_bp = Blueprint('auth_bp', __name__)

def get_dynamodb_resource():
    return boto3.resource(
        'dynamodb',
        region_name=os.getenv('CORPAI_AWS_REGION'),
        aws_access_key_id=os.getenv('CORPAI_AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('CORPAI_AWS_SECRET_ACCESS_KEY'),
    )

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    # Connect to DynamoDB
    dynamodb = get_dynamodb_resource()
    table = dynamodb.Table('Users')

    try:
        # Retrieve user information from DynamoDB based on username
        response = table.get_item(Key={'user_id': username})

        # Check if user exists
        if 'Item' not in response:
            return jsonify({"error": "User not found"}), 404

        user = response['Item']

        # Verify password
        if hashed_password == user.get('password'):
            # Generate a JWT token if password matches
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": f"Error during login: {str(e)}"}), 500

# Google OAuth2 login route
@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    token = data.get('token')

    if not token:
        return jsonify({"error": "Token is required."}), 400

    try:
        # Verify the Google token using Google OAuth2 libraries
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            os.getenv('CORPAI_GOOGLE_CLIENT_ID')
        )

        # Connect to DynamoDB
        dynamodb = get_dynamodb_resource()
        table = dynamodb.Table('Users')

        # Check if the user already exists in the DynamoDB table
        response = table.get_item(Key={'user_id': idinfo['email']})

        if 'Item' not in response:
            # Create a new user if they don't exist in DynamoDB
            table.put_item(
                Item={
                    'user_id': idinfo['email'],          # Email as the primary key
                    'google_id': idinfo['sub'],          # Google unique user ID
                    'user_name': idinfo.get('name', ''), # User's full name
                    'email_address': idinfo['email'],    # Email address
                }
            )

        # Generate a JWT token for the user
        access_token = create_access_token(identity=idinfo['email'])
        return jsonify(access_token=access_token), 200

    except ValueError:
        # Return an error if the Google token is invalid
        return jsonify({"error": "Invalid Google token"}), 401

    except Exception as e:
        # Catch any other errors
        return jsonify({"error": f"Error during Google login: {str(e)}"}), 500
