from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    id: int
    nickname: str
    rating: int
    games_played: int
    wins: int
    mafia_wins: int
    sheriff_wins: int
    citizen_wins: int

    class Config:
        orm_mode = True