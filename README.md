# Capstone Project (B) - Q-SealNet ML-DSA Signing System

| Name                      | NRP        | Field      | Jobdesc                                  |
| ------------------------- | ---------- | ---------- | ---------------------------------------- |
| Nathan Kho Pancras        | 5027231002 | Full-stack | Project Manager / Cryptographic Assessor |
| Michael Kenneth Salim     | 5027231008 | Frontend   | Frontend Developer                       |
| Amoes Noland              | 5027231028 | Backend    | DevOps / QA / CLI Dev                    |
| Fico Simhanandi           | 5027231030 | Backend    | UI Designer                              |
| Rafi' Afnaan Fathurrahman | 5027231040 | Backend    | Backend Developer / Binary Patching Specialist |

Q-SealNet is a post-quantum digital signing system built around ML-DSA. It supports detached manifests, embedded signature blocks for patched binaries, encrypted key storage, key import/export, and a web UI plus CLI.

## Features

- ML-DSA-44, ML-DSA-65, and ML-DSA-87 signing variants
- AES-256-GCM encrypted private-key storage with PBKDF2-SHA256
- Detached signature manifests and embedded signature blocks
- Key import/export for base64 and encrypted key payloads
- Duplicate key protection with explicit `overwrite=true`
- Versioned key/signature storage with a migration command
- Flask API, CLI client, pytest coverage, and a Next.js + Tailwind frontend

## Architecture

### Backend

The backend is split into focused modules under `backend/app/`:

- `algorithms.py`: ML-DSA variant registry and size metadata
- `config.py`: environment-driven settings
- `manifest.py`: detached/embedded manifest schema handling
- `storage.py`: JSON persistence layer
- `service.py`: cryptographic operations and business logic
- `routes.py`: Flask route handlers and error mapping
- `validation.py`: request validation objects
- `logging_utils.py`: structured JSON logging

`backend/main.py` is now only a thin app entrypoint.

### Frontend

The frontend is a Next.js app-router application in `frontend/` using:

- TypeScript (`.ts` / `.tsx`)
- Tailwind CSS
- `next/font` typography
- a single dashboard composed from reusable UI components

## Quick Start

### Backend

```bash
cd backend
uv sync
uv run main.py
```

Optional environment variables:

```bash
export ML_DSA_DEFAULT_VARIANT=ML-DSA-65
export PBKDF2_ITERATIONS=150000
export MAX_UPLOAD_SIZE_MB=64
export KEYS_STORAGE_DIR="$(pwd)/keys"
export SIGNATURES_STORAGE_DIR="$(pwd)/signatures"
export LOG_LEVEL=INFO
uv run main.py
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend expects the backend at `http://localhost:5000` by default.
Override it with:

```bash
export NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
pnpm dev
```

## Storage and Migration

Key and signature records are stored as JSON and now carry schema metadata.
If you have earlier ML-DSA records without schema fields, migrate them with:

```bash
cd backend
uv run python manage_storage.py migrate-storage
```

Legacy ECC PEM records are not migrated into the new ML-DSA storage model.

## Detached Manifest Format

A detached signature manifest is stored as JSON with fields such as:

```json
{
  "schema_version": 2,
  "manifest_type": "qsealnet.detached-signature",
  "signature_id": "...",
  "signature": "...base64...",
  "file_hash": "...sha256...",
  "key_id": "release-signing",
  "timestamp": "2026-03-12T...",
  "algorithm": "ML-DSA-65",
  "file_size": 12345,
  "signature_size": 3309,
  "key_encrypted": true,
  "signature_input": "raw-file-bytes"
}
```

Patched binaries append an embedded block that wraps the same manifest.

## API Overview

### Authentication

User accounts gate the signing API. Register or log in to receive a bearer
token, then send it as `Authorization: Bearer <token>` on every resource
request. Tokens are signed with `itsdangerous` using `QSEALNET_SECRET_KEY` and
expire after `SESSION_MAX_AGE_SECONDS` (default 7 days). Passwords are stored as
PBKDF2-SHA256 hashes; user records live in the `users/` storage directory.

The auth endpoints (`/auth/*`), `/` and `/health` are public; all other
endpoints below return `401` without a valid token.

#### `POST /auth/register`

Create an account. Body: `{ "username", "email", "password" }` (password ≥ 8
chars). Returns `{ "token", "user" }`.

#### `POST /auth/login`

Authenticate with `{ "identifier", "password" }` where `identifier` is a
username or email. Returns `{ "token", "user" }`.

#### `GET /auth/me`

Return the current user for the supplied bearer token.

### `POST /generate-keys`

Create a new ML-DSA key pair.

```json
{
  "key_id": "release-signing",
  "algorithm": "ML-DSA-65",
  "encrypt": true,
  "password": "secret",
  "overwrite": false
}
```

### `POST /import-key`

Import a previously exported key JSON payload.

### `POST /sign-file`

Sign uploaded file bytes and return a detached manifest.

### `POST /verify-signature`

Verify a file against a detached manifest payload.

### `POST /patch-binary`

Append an embedded signature block to a binary and return the patched artifact.

### `POST /verify-patched-binary`

Extract and verify the embedded signature block.

### `GET /keys`

List stored keys with algorithm, encryption state, and size metadata.

### `POST /export-key`

Export a key in `base64` or `encrypted` format.

### `POST /change-key-password`

Rotate the password protecting an encrypted private key.

### `GET /signatures`

List persisted signature manifests.

### `GET /health`

Return service health and object counts.

## CLI Usage

The CLI talks to the backend HTTP API.

### Authentication

The signing API is gated, so you must authenticate before any other command
will work. Log in or register first; the CLI stores the returned bearer token
and attaches it automatically to every subsequent request.

```bash
python cli.py register --username alice --email alice@example.com   # prompts for password
python cli.py login --identifier alice                              # username or email; prompts for password
python cli.py whoami                                                # show the current account
python cli.py logout                                                # remove the stored token
```

Each command also accepts its credentials inline (e.g.
`login --identifier alice --password secret8`); omit a flag to be prompted
securely. Running a gated command without a token prints
`Authentication required (run 'login' or 'register' first)`.

Tokens are stored per backend URL in `~/.qsealnet/credentials.json` (override
the location with `QSEALNET_CREDENTIALS_FILE`). The `QSEALNET_TOKEN`
environment variable takes precedence over the stored file, which is handy for
CI. `logout` only clears the local token and works even when the server is
down.

### Signing workflows

```bash
python cli.py --base-url http://localhost:5000 list-keys
python cli.py generate-key release-signing --algorithm ML-DSA-65
python cli.py generate-key demo-raw --no-encrypt --overwrite
python cli.py sign sample.bin release-signing --output sample.bin.sig
python cli.py verify sample.bin --signature sample.bin.sig
python cli.py patch sample.bin release-signing --output sample_signed.bin
python cli.py verify-patched sample_signed.bin
python cli.py export-key release-signing --format encrypted --output release-signing.encrypted.json
python cli.py import-key release-signing.encrypted.json --key-id imported-release
python cli.py change-password release-signing
```

## Testing

Run the backend test suite with `uv`:

```bash
cd backend
uv run pytest ../tests -q
```

The tests cover:

- all ML-DSA variants
- encrypted and unencrypted key flows
- detached signing and verification
- patched binary verification
- import/export round-trips
- password rotation
- storage migration and manifest backward compatibility

## Security Notes

- ML-DSA is used for signing, not encryption.
- SHA-256 is used for file metadata and tamper detection.
- Private keys are encrypted with AES-256-GCM when password protection is enabled.
- PBKDF2 iteration count, upload limits, storage paths, and default variant are configurable.
- Existing ECC records are intentionally not accepted as valid signing material under the ML-DSA backend.
