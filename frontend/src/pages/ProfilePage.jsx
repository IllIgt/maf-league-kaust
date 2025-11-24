import React, { useEffect, useState } from "react";
import { fetchCurrentPlayer } from "../api";

// мок на случай отсутствия бэка
const mockMe = {
    id: 42,
    nickname: "RedFox",
    rating: 1820,
    games: 25,
    wins: 14,
    mafiaWins: 9,
    sheriffWins: 3,
    citizenWins: 2,
};

const ProfilePage = () => {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // настоящий запрос
        fetchCurrentPlayer()
            .then((data) => {
                setPlayer(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                // fallback на мок
                setPlayer(mockMe);
                setError("Показываем тестовые данные (нет соединения с сервером)");
                setLoading(false);
            });

        // вариант только с мок-данными:
        // setTimeout(() => {
        //   setPlayer(mockMe);
        //   setLoading(false);
        // }, 400);
    }, []);

    if (loading) {
        return (
            <div className="card">
                <p className="text-muted">Загрузка профиля...</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="card">
                <p className="text-muted">
                    Нет данных. Возможно, вы ещё не авторизованы или не играли ни одной игры.
                </p>
            </div>
        );
    }

    const winRate = player.games
        ? Math.round((player.wins / player.games) * 100)
        : 0;

    return (
        <div className="grid-two">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">Личный кабинет</h1>
                    <span className="badge">Player</span>
                </div>
                {error && <p className="text-small">{error}</p>}

                <p style={{ fontSize: "1.1rem", marginBottom: 4 }}>
                    {player.nickname}
                </p>
                <p className="text-muted" style={{ marginTop: 0 }}>
                    Rating: <strong>{player.rating}</strong>
                </p>

                <div className="chip-row" style={{ marginTop: 8 }}>
                    <span className="chip">Игр: {player.games}</span>
                    <span className="chip">Побед: {player.wins}</span>
                    <span className="chip">Winrate: {winRate}%</span>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Статистика по ролям</h2>
                </div>
                <p className="text-muted">
                    Mafia wins: <strong>{player.mafiaWins ?? 0}</strong>
                </p>
                <p className="text-muted">
                    Sheriff wins: <strong>{player.sheriffWins ?? 0}</strong>
                </p>
                <p className="text-muted">
                    Citizen wins: <strong>{player.citizenWins ?? 0}</strong>
                </p>

                <p className="text-small" style={{ marginTop: 12 }}>
                    Здесь будет история игр
                </p>
            </div>
        </div>
    );
};

export default ProfilePage;