import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api";

// Временный мок на случай отсутствия бэка:
// закомментируй useEffect с API и раскомментируй useEffect с мок-данными
const mockPlayers = [
    { id: 1, nickname: "RedFox", rating: 1820, games: 25, wins: 14, role: "Mafia" },
    { id: 2, nickname: "SheriffKAUST", rating: 1790, games: 30, wins: 16, role: "Sheriff" },
    { id: 3, nickname: "SilentTownie", rating: 1710, games: 18, wins: 9, role: "Citizen" },
];

const LeaderboardPage = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // ----- реальный запрос -----
        fetchLeaderboard()
            .then((data) => {
                setPlayers(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Не удалось загрузить таблицу лидеров");
                setLoading(false);
            });

        // ----- пример с мок-данными -----
        // setTimeout(() => {
        //   setPlayers(mockPlayers);
        //   setLoading(false);
        // }, 500);
    }, []);

    return (
        <div className="card">
            <div className="card-header">
                <h1 className="card-title">Таблица лидеров</h1>
                <span className="badge">Season 1</span>
            </div>

            {loading && <p className="text-muted">Загрузка...</p>}
            {error && <p className="text-muted">{error}</p>}

            {!loading && !error && (
                <>
                    {players.length === 0 ? (
                        <p className="text-muted">Пока нет данных. Сыграйте первую игру!</p>
                    ) : (
                        <table className="table">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Ник</th>
                                <th>Рейтинг</th>
                                <th>Игр</th>
                                <th>Побед</th>
                                <th>Роль</th>
                            </tr>
                            </thead>
                            <tbody>
                            {players.map((p, index) => (
                                <tr key={p.id || p.nickname}>
                                    <td>{index + 1}</td>
                                    <td>{p.nickname}</td>
                                    <td>{p.rating}</td>
                                    <td>{p.games}</td>
                                    <td>{p.wins}</td>
                                    <td>{p.role}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};

export default LeaderboardPage;