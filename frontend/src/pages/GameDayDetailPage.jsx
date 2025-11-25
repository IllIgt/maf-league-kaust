import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const GameDayDetailPage = () => {
  const { id } = useParams();
  const [gameDay, setGameDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/game-days/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setGameDay(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load game day", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Загружаем...</div>;
  if (!gameDay) return <div>Игровой день не найден</div>;

  return (
    <div>
      <h1>
        Игровой день {new Date(gameDay.date).toLocaleDateString()}
      </h1>
      {gameDay.title && <h2>{gameDay.title}</h2>}
      {gameDay.notes && <p>{gameDay.notes}</p>}

      <h3>Сыгранные игры</h3>
      {gameDay.games.length === 0 && <p>В этот день игр не было (что странно 🙂)</p>}

      <ul>
        {gameDay.games.map((game) => (
          <li key={game.id}>
            <Link to={`/games/${game.id}`}>
              Игра #{game.id} {/* здесь можно красиво оформить: стол, сценарий, победители и т.д. */}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameDayDetailPage;