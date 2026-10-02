"""Authenticated encryption for integration secrets (Fernet = AES-128-CBC + HMAC-SHA256).

The master key lives in the server environment (APP_CONFIG_ENCRYPTION_KEY), never in the DB.
Any high-entropy string is accepted; a 32-byte Fernet key is derived from it with SHA-256.
"""
import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


class EncryptionNotConfigured(Exception):
    pass


class DecryptionFailed(Exception):
    pass


def _fernet():
    secret = (getattr(settings, "APP_CONFIG_ENCRYPTION_KEY", "") or "").strip()
    if len(secret) < 16:
        raise EncryptionNotConfigured("APP_CONFIG_ENCRYPTION_KEY is not configured on the server.")
    key = base64.urlsafe_b64encode(hashlib.sha256(secret.encode("utf-8")).digest())
    return Fernet(key)


def encrypt_secret(value: str) -> str:
    return _fernet().encrypt(value.encode("utf-8")).decode("ascii")


def decrypt_secret(token: str) -> str:
    try:
        return _fernet().decrypt(token.encode("ascii")).decode("utf-8")
    except InvalidToken as exc:
        raise DecryptionFailed("Stored secret cannot be decrypted with the current encryption key.") from exc
