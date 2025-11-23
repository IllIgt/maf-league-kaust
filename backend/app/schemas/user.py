from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    id: int
    email: EmailStr
    nickname: str
    is_gamemaster: bool
    games_played: int
    wins: int
    mafia_wins: int
    sheriff_wins: int
    citizen_wins: int
    rating: int

    class Config:
        orm_mode = True