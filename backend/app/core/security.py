import jwt
from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from jwt import PyJWTError

from app.core.config import settings  # если у тебя файл config называется иначе — скажи, поправлю


ALGORITHM = "HS256"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создание JWT токена"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Декодирование токена и возврат payload"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload

    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )