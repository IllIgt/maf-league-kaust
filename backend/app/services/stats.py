from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models import Game, GamePlayer, GameStatus, User


def recalc_stats_for_user(db: Session, user_id: int) -> None:
    """
    Пересчитать агрегированную статистику пользователя
    по всем финализированным играм.
    """
    stmt = (
        select(GamePlayer)
        .join(Game, GamePlayer.game_id == Game.id)
        .where(
            GamePlayer.player_id == user_id,
            Game.status == GameStatus.FINALIZED,
        )
    )
    rows = db.execute(stmt).scalars().all()

    games_played = len(rows)
    wins = sum(1 for r in rows if r.outcome == "win")
    mafia_wins = sum(1 for r in rows if r.outcome == "win" and r.role == "Mafia")
    sheriff_wins = sum(
        1 for r in rows if r.outcome == "win" and r.role == "Sheriff"
    )
    citizen_wins = sum(
        1 for r in rows if r.outcome == "win" and r.role == "Citizen"
    )

    rating = wins * 3  # простая формула, можно усложнить

    user = db.get(User, user_id)
    if not user:
        return

    user.games_played = games_played
    user.wins = wins
    user.mafia_wins = mafia_wins
    user.sheriff_wins = sheriff_wins
    user.citizen_wins = citizen_wins
    user.rating = rating

    db.add(user)
    db.commit()