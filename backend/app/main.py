from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.db.session import engine
from backend.app.db.session import Base
from backend.app.api.routes import games
from backend.app.api.routes import auth, week_slots, leaderboard

app = FastAPI(title="Maf Kaust League API")

# CORS — под React на localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


# Подключаем роутеры
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(week_slots.router, tags=["week-slots"])
app.include_router(games.router, prefix="/games", tags=["games"])
app.include_router(leaderboard.router, tags=["leaderboard"])