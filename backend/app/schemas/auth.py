from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    nickname: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str