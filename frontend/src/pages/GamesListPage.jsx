import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGames } from "../api";
import { useAuth } from "../AuthContext";

const GAME_STATUS_LABELS = {
    PLANNED: "Запланирована",
    IN_PROGRESS: "Идёт",
    RESULTS_PENDING: "Ожидает результатов",
    FINALIZED: "Завершена",
};

const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const GamesListPage = () => {
    const { user } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchGames()
            .then((data) => {
                // Можно отсортировать: сначала будущие, потом прошлые
                const sorted = [...data].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setGames(sorted);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Не удалось загрузить список игр");
                setLoading(false);
            });
    }, []);

    const isGameMaster = user?.roles?.includes("GameMaster");

    return (
        <div className="card">
            <div className="card-header">
                <h1 className="card-title">Игры</h1>
                <span className="badge">History & Control</span>
            </div>

            {loading && <p className="text-muted">Загрузка игр...</p>}
            {error && <p className="text-small" style={{ color: "#ff8080" }}>{error}</p>}

            {!loading && games.length === 0 && (
                <p className="text-muted">Пока нет ни одной игры.</p>
            )}

            {!loading && games.length > 0 && (
                <table className="table">
                    <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Место</th>
                        <th>Статус</th>
                        <th>Игроков</th>
                        {isGameMaster && <th>Управление</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {games.map((g) => (
                        <tr key={g.id}>
                            <td>{formatDateTime(g.date)}</td>
                            <td>{g.place}</td>
                            <td>{GAME_STATUS_LABELS[g.status] || g.status}</td>
                            <td>{g.players?.length ?? 0}</td>
                            {isGameMaster ? (
                                <td>
                                    <Link to={`/games/${g.id}`} className="text-small">
                                        Открыть
                                    </Link>
                                </td>
                            ) : (
                                <td>
                                    <Link to={`/games/${g.id}`} className="text-small">
                                        Детали
                                    </Link>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default GamesListPage;
