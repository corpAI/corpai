import boto3

def fetch_files_from_s3(bucket_name, file_keys, access_key, secret_key, region):
    """
    Fetches multiple files from an S3 bucket and combines their contents using provided credentials.
    
    :param bucket_name: The name of the S3 bucket.
    :param file_keys: List of file keys to fetch from the S3 bucket, or None to fetch all files.
    :param access_key: AWS access key from the configuration.
    :param secret_key: AWS secret access key from the configuration.
    :param region: AWS region from the configuration.
    :return: Combined content of the files, or an error message.
    """
    # Initialize S3 client with provided credentials
    s3_client = boto3.client('s3', 
                             aws_access_key_id=access_key, 
                             aws_secret_access_key=secret_key, 
                             region_name=region)

    combined_content = ""

    try:
        if not file_keys:
            # Fetch all files in the bucket if file_keys is None
            response = s3_client.list_objects_v2(Bucket=bucket_name)
            if 'Contents' not in response:
                return None, "No files found in the specified bucket."

            file_keys = [item['Key'] for item in response['Contents']]

        for file_key in file_keys:
            response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
            file_content = response['Body'].read()

            try:
                # Try to decode the file content as UTF-8
                decoded_content = file_content.decode('utf-8')
                combined_content += f"\n--- File: {file_key} ---\n{decoded_content}"
            except UnicodeDecodeError:
                # If decoding fails, handle the file as binary content
                combined_content += f"\n--- File: {file_key} ---\n[Binary file - not displayed]"

        return combined_content, None  # Return the combined content with no errors

    except Exception as e:
        return None, f"Error fetching files from S3: {str(e)}"
