from io import BytesIO
from pathlib import Path
import sys

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import create_app
from app.config import AppConfig


@pytest.fixture()
def app(tmp_path):
    config = AppConfig(
        storage_dir=str(tmp_path / "keys"),
        signatures_dir=str(tmp_path / "signatures"),
        users_dir=str(tmp_path / "users"),
        max_upload_size_bytes=2 * 1024 * 1024,
        pbkdf2_iterations=2_000,
        default_algorithm="ML-DSA-44",
        log_level="INFO",
        secret_key="test-secret-key",
        session_max_age_seconds=3600,
    )
    return create_app(config)


@pytest.fixture()
def auth_token(app):
    auth_service = app.config["AUTH_SERVICE"]
    auth_service.register("tester", "tester@example.com", "test-password")
    return auth_service.issue_token("tester")


@pytest.fixture()
def client(app, auth_token):
    """Test client that is authenticated by default for protected endpoints."""
    test_client = app.test_client()
    test_client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {auth_token}"
    return test_client


@pytest.fixture()
def anonymous_client(app):
    return app.test_client()


@pytest.fixture()
def service(app):
    return app.config["SIGNER_SERVICE"]


@pytest.fixture()
def sample_file_bytes():
    return b"q-sealnet sample payload\x00\x01\x02"


@pytest.fixture()
def upload(sample_file_bytes):
    def _make(name="sample.bin", payload=None):
        return BytesIO(payload or sample_file_bytes), name
    return _make
