from datetime import datetime, date
from typing import List, Optional

from pydantic import BaseModel

from backend.app.models.game import GameStatus


class GamePlayerResult(BaseModel):
    playerId: int
    nickname: Optional[str] = None
    role: Optional[str] = None
    outcome: Optional[str] = None


class GameOut(BaseModel):
    id: int
    date: datetime
    place: str
    status: GameStatus
    notes: Optional[str]
    players: List[GamePlayerResult]

    class Config:
        orm_mode = True


class GameCreateFromSlot(BaseModel):
    date: date
    place: str


class GameResultsUpdate(BaseModel):
    players: List[GamePlayerResult]
    notes: Optional[str] = None