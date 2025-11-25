from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from .. import models, schemas

router = APIRouter(prefix="/game-days", tags=["game-days"])

@router.get("/", response_model=List[schemas.GameDayWithStats])
def list_game_days(db: Session = Depends(get_db), limit: int = 50, offset: int = 0):
    q = (
        db.query(
            models.GameDay,
            db.func.count(models.Game.id).label("games_count")
        )
        .outerjoin(models.Game, models.Game.game_day_id == models.GameDay.id)
        .group_by(models.GameDay.id)
        .order_by(models.GameDay.date.desc())
        .limit(limit)
        .offset(offset)
    )

    result = []
    for gd, games_count in q:
        item = schemas.GameDayWithStats.from_orm(gd)
        item.games_count = games_count
        result.append(item)

    return result

@router.get("/{game_day_id}", response_model=schemas.GameDayDetail)
def get_game_day(game_day_id: int, db: Session = Depends(get_db)):
    gd: models.GameDay = (
        db.query(models.GameDay)
        .filter(models.GameDay.id == game_day_id)
        .first()
    )
    if not gd:
        raise HTTPException(status_code=404, detail="Game day not found")
    # games подтянутся через relationship, если настроен lazy="select"
    return gd