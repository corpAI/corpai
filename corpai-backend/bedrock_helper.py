import boto3
import os
import json
from s3_helper import fetch_files_from_s3

# Initialize Bedrock client with environment variables
bedrock_client = boto3.client(
    'bedrock-runtime',  # Use the correct service name for Bedrock
    aws_access_key_id=os.getenv('CORPAI_AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('CORPAI_AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('CORPAI_AWS_REGION')
)

# Global variables to store S3 context and configuration
cached_context = None
cached_bucket_name = None
cached_file_keys = None

def fetch_cached_files_from_s3(bucket_name, file_keys=None):
    """
    Wrapper around fetch_files_from_s3 to add caching.

    :param bucket_name: The name of the S3 bucket.
    :param file_keys: List of file keys to fetch from the S3 bucket, or None to fetch all files.
    :return: Combined content of the files.
    """
    global cached_context, cached_bucket_name, cached_file_keys

    # Check if the context is already loaded for the given bucket and file_keys
    if bucket_name == cached_bucket_name and file_keys == cached_file_keys and cached_context is not None:
        return cached_context, None

    # Update the cached configuration
    cached_bucket_name = bucket_name
    cached_file_keys = file_keys

    # Fetch the content and cache it
    combined_content, error = fetch_files_from_s3(bucket_name, file_keys)
    if error:
        return None, error

    cached_context = combined_content
    return combined_content, None

def clear_cached_context():
    """
    Clear the cached S3 context.
    """
    global cached_context, cached_bucket_name, cached_file_keys
    cached_context = None
    cached_bucket_name = None
    cached_file_keys = None

def query_bedrock(user_input):
    """
    Queries Amazon Bedrock using the cached context and user input.

    :param user_input: The user's query.
    :return: Bedrock's response, or an error message.
    """
    global cached_context
    if cached_context is None:
        return "Error: No context loaded. Please load S3 content first.", None

    try:
        # Construct the messages list for the Messages API
        messages = [
            {"role": "system", "content": cached_context},
            {"role": "user", "content": user_input}
        ]

        # Prepare the payload as JSON
        payload = {
            "messages": messages,
            "max_tokens": 200,  # Adjust as needed for response length
            "temperature": 0.7,  # Adjust for response creativity
            "anthropic_version": "claude-v1.0"  # Use the correct version string
        }

        # Convert combined input to JSON
        json_input = json.dumps(payload)

        # Invoke the Bedrock model using the Messages API
        response = bedrock_client.invoke_model(
            modelId='anthropic.claude.v1',  # Use the correct model ID
            contentType='application/json',
            accept='application/json',
            body=json_input
        )

        # Read the Bedrock response
        bedrock_output = json.loads(response['body'].read().decode('utf-8'))

        # Extract the assistant's response from the response body
        return bedrock_output.get("completions", [{}])[0].get("completion", "No response available."), None

    except Exception as e:
        return None, f"Error querying Bedrock: {str(e)}"