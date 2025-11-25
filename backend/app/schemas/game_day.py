from datetime import date
from pydantic import BaseModel
from .game import Game  # твоя схема Game
class GameDayBase(BaseModel):
    date: date
    title: str | None = None
    notes: str | None = None

class GameDayCreate(GameDayBase):
    pass

class GameDay(GameDayBase):
    id: int

    class Config:
        orm_mode = True

class GameDayWithStats(GameDay):
    games_count: int


class GameDayDetail(GameDay):
    games: list[Game] = []