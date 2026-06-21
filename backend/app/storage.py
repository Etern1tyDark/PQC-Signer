import json
import os


def _safe_record_id(record_id):
    """Reject ids that could escape the storage directory."""
    record_id = str(record_id)
    if not record_id or "/" in record_id or "\\" in record_id or os.path.sep in record_id or ".." in record_id:
        raise ValueError("Invalid record id")
    return record_id


class JsonStorage:
    def __init__(self, keys_dir, signatures_dir, users_dir=None):
        self.keys_dir = keys_dir
        self.signatures_dir = signatures_dir
        self.users_dir = users_dir
        os.makedirs(self.keys_dir, exist_ok=True)
        os.makedirs(self.signatures_dir, exist_ok=True)
        if self.users_dir:
            os.makedirs(self.users_dir, exist_ok=True)

    def get_user_path(self, username):
        return os.path.join(self.users_dir, f"{_safe_record_id(username)}.json")

    def list_usernames(self):
        if not self.users_dir or not os.path.exists(self.users_dir):
            return []
        return sorted(
            filename[:-5]
            for filename in os.listdir(self.users_dir)
            if filename.endswith(".json")
        )

    def read_user_record(self, username):
        path = self.get_user_path(username)
        if not os.path.exists(path):
            return None
        return self.read_json(path)

    def write_user_record(self, username, payload):
        self.write_json(self.get_user_path(username), payload)

    def get_key_path(self, key_id):
        return os.path.join(self.keys_dir, f"{key_id}.json")

    def get_signature_path(self, signature_id):
        return os.path.join(self.signatures_dir, f"{signature_id}.json")

    def list_key_ids(self):
        if not os.path.exists(self.keys_dir):
            return []
        return sorted(
            filename[:-5] for filename in os.listdir(self.keys_dir) if filename.endswith(".json")
        )

    def list_signature_ids(self):
        if not os.path.exists(self.signatures_dir):
            return []
        return sorted(
            filename[:-5]
            for filename in os.listdir(self.signatures_dir)
            if filename.endswith(".json")
        )

    def read_json(self, path):
        with open(path, "r") as f:
            return json.load(f)

    def write_json(self, path, payload):
        with open(path, "w") as f:
            json.dump(payload, f, indent=2)

    def read_key_record(self, key_id):
        path = self.get_key_path(key_id)
        if not os.path.exists(path):
            return None
        return self.read_json(path)

    def write_key_record(self, key_id, payload):
        self.write_json(self.get_key_path(key_id), payload)

    def read_signature_record(self, signature_id):
        path = self.get_signature_path(signature_id)
        if not os.path.exists(path):
            return None
        return self.read_json(path)

    def write_signature_record(self, signature_id, payload):
        self.write_json(self.get_signature_path(signature_id), payload)
