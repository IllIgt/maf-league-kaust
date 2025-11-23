# app/core/config.py
import os
from datetime import timedelta
from pydantic import BaseSettings
# Пример: postgresql+psycopg://user:password@localhost:5432/maf_kaust_league
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://maf_user:maf_password@localhost:5432/maf_kaust_league",
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 день

MIN_PLAYERS_FOR_GAME = 10

DEFAULT_GAME_HOUR = 19
DEFAULT_GAME_MINUTE = 30

class Settings(BaseSettings):
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    class Config:
        env_file = ".env"


settings = Settings()

def access_token_expires_delta() -> timedelta:
    return timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)