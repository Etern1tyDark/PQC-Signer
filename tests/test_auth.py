import json


def test_register_returns_token_and_user(anonymous_client):
    response = anonymous_client.post(
        "/auth/register",
        json={"username": "newuser", "email": "new@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    body = response.json
    assert body["success"] is True
    assert body["token"]
    assert body["user"]["username"] == "newuser"
    assert body["user"]["email"] == "new@example.com"
    assert "password" not in body["user"]


def test_register_rejects_short_password(anonymous_client):
    response = anonymous_client.post(
        "/auth/register",
        json={"username": "shorty", "email": "shorty@example.com", "password": "short"},
    )
    assert response.status_code == 400
    assert response.json["success"] is False


def test_register_rejects_duplicate_username(anonymous_client):
    payload = {"username": "dupe", "email": "dupe@example.com", "password": "password123"}
    assert anonymous_client.post("/auth/register", json=payload).status_code == 201
    response = anonymous_client.post(
        "/auth/register",
        json={"username": "dupe", "email": "other@example.com", "password": "password123"},
    )
    assert response.status_code == 409


def test_login_by_username_and_email(anonymous_client):
    anonymous_client.post(
        "/auth/register",
        json={"username": "loginuser", "email": "login@example.com", "password": "password123"},
    )
    by_username = anonymous_client.post(
        "/auth/login", json={"identifier": "loginuser", "password": "password123"}
    )
    by_email = anonymous_client.post(
        "/auth/login", json={"identifier": "login@example.com", "password": "password123"}
    )
    assert by_username.status_code == 200
    assert by_email.status_code == 200
    assert by_username.json["token"]


def test_login_rejects_bad_password(anonymous_client):
    anonymous_client.post(
        "/auth/register",
        json={"username": "pwuser", "email": "pw@example.com", "password": "password123"},
    )
    response = anonymous_client.post(
        "/auth/login", json={"identifier": "pwuser", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_protected_endpoint_requires_auth(anonymous_client):
    assert anonymous_client.get("/keys").status_code == 401


def test_me_returns_current_user(anonymous_client):
    register = anonymous_client.post(
        "/auth/register",
        json={"username": "meuser", "email": "me@example.com", "password": "password123"},
    )
    token = register.json["token"]
    response = anonymous_client.get(
        "/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json["user"]["username"] == "meuser"


def test_invalid_token_rejected(anonymous_client):
    response = anonymous_client.get(
        "/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401


def test_authenticated_client_can_list_keys(client):
    assert client.get("/keys").status_code == 200
