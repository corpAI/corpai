from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # Import CORS
from auth import auth 
from config import Config
from configurations import configurations_bp
from s3_and_bedrock import bedrock_bp
from dotenv import load_dotenv
import os

# Load environment variables from .env file - helps in both local and prod
load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(configurations_bp)
app.register_blueprint(bedrock_bp, url_prefix='/bedrock')

if __name__ == '__main__':
    app.run()
