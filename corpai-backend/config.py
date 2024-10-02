import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    CORPAI_AWS_ACCESS_KEY_ID = os.getenv('CORPAI_AWS_ACCESS_KEY_ID')
    CORPAI_AWS_SECRET_ACCESS_KEY = os.getenv('CORPAI_AWS_SECRET_ACCESS_KEY')
    CORPAI_AWS_REGION = os.getenv('CORPAI_AWS_REGION')