from flask import Blueprint, request, jsonify
from s3_helper import fetch_files_from_s3
from bedrock_helper import query_bedrock
import os

# Create a new blueprint for Bedrock and S3 functionalities
bedrock_bp = Blueprint('bedrock_bp', __name__)

@bedrock_bp.route('/query_with_multiple_files', methods=['POST'])
def handle_query():
    """
    This route handles queries with multiple S3 files and passes context to Bedrock.
    """
    try:
        data = request.json
        input_text = data.get('input_text')
        bucket_name = data.get('bucket_name')
        file_keys = data.get('file_keys')

        if not input_text or not bucket_name or not file_keys:
            return jsonify({'error': 'Input text, bucket name, and file keys are required'}), 400

        # Fetch files from S3
        context_from_files, error = fetch_files_from_s3(bucket_name, file_keys)
        if error:
            return jsonify({'error': error}), 500

        # Query Bedrock with context from files and user input
        bedrock_response, error = query_bedrock(context_from_files, input_text)
        if error:
            return jsonify({'error': error}), 500

        # Return Bedrock's response
        return jsonify({'bedrock_output': bedrock_response})

    except Exception as e:
        return jsonify({'error': f"Server error: {str(e)}"}), 500
