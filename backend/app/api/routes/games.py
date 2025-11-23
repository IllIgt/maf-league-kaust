from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_gamemaster, get_current_user
from app.core.config import MIN_PLAYERS_FOR_GAME, DEFAULT_GAME_HOUR, DEFAULT_GAME_MINUTE
from app.models import Game, GamePlayer, Availability, GameStatus, User
from app.schemas import (
    GameOut,
    GameCreateFromSlot,
    GamePlayerResult,
    GameResultsUpdate,
)
from app.services.stats import recalc_stats_for_user

router = APIRouter()


@router.post("/from-slot", response_model=GameOut)
def create_game_from_slot(
    payload: GameCreateFromSlot,
    db: Session = Depends(get_db),
    gm: User = Depends(get_current_gamemaster),
):
    stmt = select(User).join(Availability).where(
        Availability.date == payload.date
    )
    players = db.execute(stmt).scalars().all()

    if len(players) < MIN_PLAYERS_FOR_GAME:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough players for game (need >= {MIN_PLAYERS_FOR_GAME})",
        )

    dt = datetime.combine(payload.date, datetime.min.time()).replace(
        hour=DEFAULT_GAME_HOUR,
        minute=DEFAULT_GAME_MINUTE,
    )

    game = Game(
        date=dt,
        place=payload.place,
        status=GameStatus.PLANNED,
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    for user in players:
        gp = GamePlayer(
            game_id=game.id,
            player_id=user.id,
            role=None,
            outcome=None,
        )
        db.add(gp)
    db.commit()
    db.refresh(game)

    return GameOut(
        id=game.id,
        date=game.date,
        place=game.place,
        status=game.status,
        notes=game.notes,
        players=[
            GamePlayerResult(
                playerId=gp.player_id,
                nickname=gp.player.nickname,
                role=gp.role,
                outcome=gp.outcome,
            )
            for gp in game.players
        ],
    )


@router.get("", response_model=List[GameOut])
def list_games(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    games = db.execute(select(Game).order_by(Game.date.desc())).scalars().all()
    result: List[GameOut] = []
    for g in games:
        result.append(
            GameOut(
                id=g.id,
                date=g.date,
                place=g.place,
                status=g.status,
                notes=g.notes,
                players=[
                    GamePlayerResult(
                        playerId=gp.player_id,
                        nickname=gp.player.nickname,
                        role=gp.role,
                        outcome=gp.outcome,
                    )
                    for gp in g.players
                ],
            )
        )
    return result


@router.get("/{game_id}", response_model=GameOut)
def get_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    game = db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return GameOut(
        id=game.id,
        date=game.date,
        place=game.place,
        status=game.status,
        notes=game.notes,
        players=[
            GamePlayerResult(
                playerId=gp.player_id,
                nickname=gp.player.nickname,
                role=gp.role,
                outcome=gp.outcome,
            )
            for gp in game.players
        ],
    )


@router.post("/{game_id}/start")
def start_game(
    game_id: int,
    db: Session = Depends(get_db),
    gm: User = Depends(get_current_gamemaster),
):
    game = db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != GameStatus.PLANNED:
        raise HTTPException(
            status_code=400,
            detail="Game must be in PLANNED status to start",
        )

    game.status = GameStatus.IN_PROGRESS
    db.add(game)
    db.commit()
    return {"ok": True, "status": game.status}


@router.post("/{game_id}/end")
def end_game(
    game_id: int,
    db: Session = Depends(get_db),
    gm: User = Depends(get_current_gamemaster),
):
    game = db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status != GameStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=400,
            detail="Game must be IN_PROGRESS to end",
        )

    game.status = GameStatus.RESULTS_PENDING
    db.add(game)
    db.commit()
    return {"ok": True, "status": game.status}


@router.post("/{game_id}/results")
def save_results(
    game_id: int,
    payload: GameResultsUpdate,
    db: Session = Depends(get_db),
    gm: User = Depends(get_current_gamemaster),
):
    game = db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status not in (GameStatus.IN_PROGRESS, GameStatus.RESULTS_PENDING):
        raise HTTPException(
            status_code=400,
            detail="Game must be IN_PROGRESS or RESULTS_PENDING to update results",
        )

    game.notes = payload.notes
    db.add(game)

    gps = {gp.player_id: gp for gp in game.players}

    for p in payload.players:
        gp = gps.get(p.playerId)
        if not gp:
            continue
        gp.role = p.role
        gp.outcome = p.outcome
        db.add(gp)

    db.commit()
    return {"ok": True}


@router.post("/{game_id}/finalize")
def finalize_game(
    game_id: int,
    db: Session = Depends(get_db),
    gm: User = Depends(get_current_gamemaster),
):
    game = db.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game.status not in (GameStatus.IN_PROGRESS, GameStatus.RESULTS_PENDING):
        raise HTTPException(
            status_code=400,
            detail="Game must be IN_PROGRESS or RESULTS_PENDING to finalize",
        )

    if not game.players:
        raise HTTPException(
            status_code=400,
            detail="Game has no players to finalize",
        )

    game.status = GameStatus.FINALIZED
    db.add(game)
    db.commit()

    player_ids = {gp.player_id for gp in game.players}
    for pid in player_ids:
        recalc_stats_for_user(db, pid)

    return {"ok": True, "status": game.status}