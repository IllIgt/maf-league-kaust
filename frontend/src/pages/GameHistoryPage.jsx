import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const GameHistoryPage = () => {
  const [gameDays, setGameDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/game-days")
      .then((res) => res.json())
      .then((data) => {
        setGameDays(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load game days", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загружаем историю игр...</div>;

  return (
    <div className="history-page">
      <h1>История игровых дней</h1>
      {gameDays.length === 0 && <p>Пока нет сыгранных дней.</p>}

      <ul className="game-day-list">
        {gameDays.map((day) => (
          <li key={day.id} className="game-day-item">
            <Link to={`/game-days/${day.id}`}>
              <div className="game-day-date">
                {new Date(day.date).toLocaleDateString()}
              </div>
              {day.title && <div className="game-day-title">{day.title}</div>}
              <div className="game-day-meta">
                Игр в этот день: {day.games_count}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameHistoryPage;