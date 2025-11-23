import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Enum,
    ForeignKey,
    Date,
    Text,
)
from sqlalchemy.orm import relationship

from backend.app.db.session import Base


class GameStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESULTS_PENDING = "RESULTS_PENDING"
    FINALIZED = "FINALIZED"


class Availability(Base):
    """
    Дни, когда игрок готов играть.
    """
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)

    user = relationship("User", back_populates="availabilities")


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    place = Column(String, nullable=False)
    status = Column(Enum(GameStatus), nullable=False, default=GameStatus.PLANNED)
    notes = Column(Text, nullable=True)

    players = relationship("GamePlayer", back_populates="game")


class GamePlayer(Base):
    __tablename__ = "game_players"

    id = Column(Integer, primary_key=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=True)  # Mafia, Sheriff, Citizen, ...
    outcome = Column(String, nullable=True)  # win / lose / unknown

    game = relationship("Game", back_populates="players")
    player = relationship("User", back_populates="game_players")