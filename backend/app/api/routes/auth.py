from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app import hash_password, verify_password, create_access_token
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, UserBase

router = APIRouter()


@router.post("/register", response_model=UserBase)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.execute(select(User).where(User.email == request.email)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.execute(select(User).where(User.nickname == request.nickname)).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Nickname already taken")

    user = User(
        email=request.email,
        nickname=request.nickname,
        password_hash=hash_password(request.password),
        is_active=True,
        is_gamemaster=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=UserBase)
def login(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = db.execute(select(User).where(User.email == request.email)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User inactive")

    token = create_access_token(user.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # на проде True + HTTPS
    )
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}


@router.get("/me", response_model=UserBase)
def me(current_user: User = Depends(get_current_user)):
    return current_user