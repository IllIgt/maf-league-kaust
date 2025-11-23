from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from backend.app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nickname = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_gamemaster = Column(Boolean, default=False)

    # агрегированные статистики
    games_played = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    mafia_wins = Column(Integer, default=0)
    sheriff_wins = Column(Integer, default=0)
    citizen_wins = Column(Integer, default=0)
    rating = Column(Integer, default=0)

    availabilities = relationship("Availability", back_populates="user")
    game_players = relationship("GamePlayer", back_populates="player")