from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import hashlib
import boto3
from google.oauth2 import id_token
from google.auth.transport import requests
import os

auth = Blueprint('auth', __name__)

def get_dynamodb_client():
    return boto3.resource(
        'dynamodb',
        region_name=os.getenv('AWS_REGION'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    )

try:
    tables = get_dynamodb_client().tables.all()
    print("DynamoDB tables:")
    for table in tables:
        print(table.name)
except Exception as e:
    print(f"Error occurred: {e}")

@auth.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    dynamodb = get_dynamodb_client()
    table = dynamodb.Table('Users')

    response = table.get_item(Key={'user_id': username})

    if 'Item' not in response:
        return jsonify({"msg": "User not found"}), 404

    user = response['Item']

    if hashed_password == user['password']:
        token = create_access_token(identity=username)
        return jsonify(token=token), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

@auth.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    token = data.get('token')

    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), os.getenv('GOOGLE_CLIENT_ID'))

        dynamodb = get_dynamodb_client()
        table = dynamodb.Table('Users')

        # Check if the user already exists
        response = table.get_item(Key={'user_id': idinfo['email']})

        if 'Item' not in response:
            # Create a new user if they don't exis
            table.put_item(
                Item={
                    'user_id': idinfo['email'],        # Email as the primary key
                    'google_id': idinfo['sub'],         # Google unique user ID
                    'user_name': idinfo.get('name', ''),     # User's full name
                    'email_address': idinfo['email'],           # Email
                }
            )

        # Generate a JWT token for the user
        token = create_access_token(identity=idinfo['email'])
        return jsonify(token=token), 200

    except ValueError:
        # Invalid Google token
        return jsonify({"msg": "Invalid Google token"}), 401
