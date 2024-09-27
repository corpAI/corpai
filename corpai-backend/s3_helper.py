import boto3

# Initialize S3 client
s3_client = boto3.client('s3')

def fetch_files_from_s3(bucket_name, file_keys):
    """
    Fetches multiple files from an S3 bucket and combines their contents.

    :param bucket_name: The name of the S3 bucket.
    :param file_keys: List of file keys to fetch from the S3 bucket.
    :return: Combined content of the files, or an error message.
    """
    combined_content = ""

    try:
        for file_key in file_keys:
            response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
            file_content = response['Body'].read().decode('utf-8')
            combined_content += f"\n--- File: {file_key} ---\n{file_content}"

        return combined_content, None  # Return the combined content with no errors

    except Exception as e:
        return None, f"Error fetching files from S3: {str(e)}"
