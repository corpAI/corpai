from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from auth import auth 
from config import Config
from configurations import configurations_bp

app = Flask(__name__)
app.config.from_object(Config)

JWTManager(app)
CORS(app)

app.register_blueprint(auth, url_prefix='/auth')
# Register the configurations blueprint
app.register_blueprint(configurations_bp)

if __name__ == '__main__':
    app.run(debug=True)
