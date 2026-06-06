from flask import Flask
from flask_cors import CORS

from .auth import AuthService
from .config import AppConfig
from .logging_utils import configure_logging
from .routes import api, register_error_handlers
from .service import MLDSASignerService
from .storage import JsonStorage


def create_app(config=None):
    app = Flask(__name__)
    CORS(app)

    app_config = config or AppConfig.from_env()
    configure_logging(app_config.log_level)

    app.config["MAX_CONTENT_LENGTH"] = app_config.max_upload_size_bytes
    app.config["SECRET_KEY"] = app_config.secret_key

    storage = JsonStorage(
        app_config.storage_dir, app_config.signatures_dir, app_config.users_dir
    )
    service = MLDSASignerService(app_config, storage, app.logger)
    auth_service = AuthService(app_config, storage, app.logger)
    app.config["APP_CONFIG"] = app_config
    app.config["SIGNER_SERVICE"] = service
    app.config["AUTH_SERVICE"] = auth_service

    app.register_blueprint(api)
    register_error_handlers(app)
    return app
