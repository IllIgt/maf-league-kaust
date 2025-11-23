from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db
from backend.app.models import User
from backend.app.schemas import LeaderboardEntry

router = APIRouter()


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def leaderboard(db: Session = Depends(get_db)):
    stmt = (
        select(User)
        .where(User.is_active == True)  # noqa: E712
        .order_by(User.rating.desc(), User.games_played.desc())
    )
    users = db.execute(stmt).scalars().all()
    return [
        LeaderboardEntry(
            id=u.id,
            nickname=u.nickname,
            rating=u.rating,
            games_played=u.games_played,
            wins=u.wins,
            mafia_wins=u.mafia_wins,
            sheriff_wins=u.sheriff_wins,
            citizen_wins=u.citizen_wins,
        )
        for u in users
    ]