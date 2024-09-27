import boto3
import os

# Initialize Bedrock client with environment variables
bedrock_client = boto3.client(
    'bedrock',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

def query_bedrock(context, user_input):
    """
    Queries Amazon Bedrock using the context from files and the user input.

    :param context: Combined content from S3 files.
    :param user_input: The user's query.
    :return: Bedrock's response, or an error message.
    """
    try:
        # Combine the context from S3 with the user's query
        combined_input = f"Context: {context}\n\nUser Query: {user_input}"

        # Invoke the Bedrock model endpoint (replace 'YOUR_MODEL_ID' with the actual Bedrock Model ID)
        response = bedrock_client.invoke_model_endpoint(
            ModelId='YOUR_MODEL_ID',  # Replace with actual Bedrock Model ID
            Body=combined_input,
            ContentType='application/json',
            Accept='application/json'
        )

        # Read the Bedrock response
        bedrock_output = response['Body'].read().decode('utf-8')

        return bedrock_output, None

    except Exception as e:
        return None, f"Error querying Bedrock: {str(e)}"
