from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from auth import auth_bp
from configurations import configurations_bp
from s3_and_bedrock import bedrock_bp
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

# Enable CORS
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(configurations_bp)
app.register_blueprint(bedrock_bp, url_prefix='/bedrock')

if __name__ == '__main__':
    app.run(debug=True)
