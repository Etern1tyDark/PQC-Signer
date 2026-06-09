import base64
import hmac
import re
from datetime import UTC, datetime

from Crypto.Hash import SHA256
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

USER_RECORD_SCHEMA_VERSION = 1
USER_RECORD_TYPE = "user_account"
TOKEN_SALT = "qsealnet-auth-session"

USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,32}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _utc_now_iso():
    return datetime.now(UTC).isoformat()


class AuthError(ValueError):
    """Raised for invalid auth input (maps to HTTP 400)."""


class InvalidCredentialsError(AuthError):
    """Raised when login credentials do not match (maps to HTTP 401)."""


class DuplicateUserError(AuthError):
    """Raised when a username/email is already taken (maps to HTTP 409)."""


class AuthService:
    def __init__(self, config, storage, logger):
        self.config = config
        self.storage = storage
        self.logger = logger
        self.serializer = URLSafeTimedSerializer(config.secret_key, salt=TOKEN_SALT)

    def _log(self, level, event, **details):
        getattr(self.logger, level)(event, extra={"event": event, "details": details})

    # -- password hashing -------------------------------------------------
    def _hash_password(self, password, salt=None):
        salt = salt or get_random_bytes(16)
        derived = PBKDF2(
            password.encode("utf-8"),
            salt,
            32,
            count=self.config.pbkdf2_iterations,
            hmac_hash_module=SHA256,
        )
        return {
            "kdf": "PBKDF2-SHA256",
            "kdf_iterations": self.config.pbkdf2_iterations,
            "salt": base64.b64encode(salt).decode("utf-8"),
            "hash": base64.b64encode(derived).decode("utf-8"),
        }

    def _verify_password(self, password, stored):
        try:
            salt = base64.b64decode(stored["salt"])
            expected = base64.b64decode(stored["hash"])
            derived = PBKDF2(
                password.encode("utf-8"),
                salt,
                len(expected),
                count=int(stored.get("kdf_iterations", self.config.pbkdf2_iterations)),
                hmac_hash_module=SHA256,
            )
            return hmac.compare_digest(derived, expected)
        except Exception:
            return False

    # -- validation -------------------------------------------------------
    def _validate_registration(self, username, email, password):
        if not USERNAME_RE.match(username):
            raise AuthError(
                "Username must be 3-32 characters using letters, numbers, '.', '-' or '_'."
            )
        if not EMAIL_RE.match(email):
            raise AuthError("A valid email address is required.")
        if len(password) < 8:
            raise AuthError("Password must be at least 8 characters long.")

    def _find_by_email(self, email):
        email = email.lower()
        for username in self.storage.list_usernames():
            record = self.storage.read_user_record(username)
            if record and record.get("email", "").lower() == email:
                return record
        return None

    # -- public API -------------------------------------------------------
    def register(self, username, email, password):
        username = username.strip()
        email = email.strip()
        self._validate_registration(username, email, password)

        if self.storage.read_user_record(username) is not None:
            raise DuplicateUserError("That username is already taken.")
        if self._find_by_email(email) is not None:
            raise DuplicateUserError("An account with that email already exists.")

        record = {
            "schema_version": USER_RECORD_SCHEMA_VERSION,
            "record_type": USER_RECORD_TYPE,
            "username": username,
            "email": email,
            "password": self._hash_password(password),
            "created_at": _utc_now_iso(),
        }
        self.storage.write_user_record(username, record)
        self._log("info", "user_registered", username=username)
        return self._public_user(record)

    def authenticate(self, identifier, password):
        identifier = (identifier or "").strip()
        record = self.storage.read_user_record(identifier)
        if record is None and "@" in identifier:
            record = self._find_by_email(identifier)

        if record is None or not self._verify_password(password, record["password"]):
            raise InvalidCredentialsError("Invalid credentials.")

        self._log("info", "user_login", username=record["username"])
        return self._public_user(record)

    def issue_token(self, username):
        return self.serializer.dumps({"username": username})

    def resolve_token(self, token):
        if not token:
            return None
        try:
            data = self.serializer.loads(
                token, max_age=self.config.session_max_age_seconds
            )
        except SignatureExpired:
            return None
        except BadSignature:
            return None
        if not isinstance(data, dict):
            return None
        record = self.storage.read_user_record(data.get("username"))
        if record is None:
            return None
        return self._public_user(record)

    def _public_user(self, record):
        return {
            "username": record["username"],
            "email": record["email"],
            "created_at": record.get("created_at"),
        }
