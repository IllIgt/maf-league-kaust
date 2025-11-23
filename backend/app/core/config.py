import os
from datetime import timedelta

# URL базы данных берём из переменной окружения (её даёт docker-compose через .env)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./test.db",  # запасной вариант для локального запуска без Postgres
)

# Секрет для JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-dev-key")

# Алгоритм JWT
JWT_ALGORITHM = "HS256"

# Время жизни access-токена
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 часа


def access_token_expires_delta() -> timedelta:
    return timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)