import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    fetchGame,
    startGame,
    saveGameResults,
    finalizeGame,
    endGame,
} from "../api";
import { useAuth } from "../AuthContext";

const GAME_STATUS_LABELS = {
    PLANNED: "Запланирована",
    IN_PROGRESS: "Идёт",
    RESULTS_PENDING: "Ожидает результатов",
    FINALIZED: "Завершена",
};

const AVAILABLE_ROLES = ["Mafia", "Sheriff", "Citizen", "Don", "Doctor"];
const AVAILABLE_OUTCOMES = ["win", "lose", "unknown"];

const formatDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const GameDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [game, setGame] = useState(null);
    const [editablePlayers, setEditablePlayers] = useState([]);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const isGameMaster = user?.roles?.includes("GameMaster");

    const canEdit =
        isGameMaster &&
        game &&
        (game.status === "IN_PROGRESS" || game.status === "RESULTS_PENDING");

    const isFinalized = game?.status === "FINALIZED";
    const handleEndGame = async () => {
        if (!window.confirm("Завершить игру? Результаты можно будет заполнить позже.")) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            await endGame(id);
            setMessage("Игра переведена в статус 'Ожидает результатов'");
            loadGame();
        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка при завершении игры");
        } finally {
            setSaving(false);
        }
    };
    const loadGame = () => {
        setLoading(true);
        setError("");
        fetchGame(id)
            .then((g) => {
                setGame(g);
                setEditablePlayers(
                    (g.players || []).map((p) => ({
                        ...p,
                        role: p.role || "",
                        outcome: p.outcome || "unknown",
                    }))
                );
                setNotes(g.notes || "");
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Не удалось загрузить игру");
                setLoading(false);
            });
    };

    useEffect(() => {
        loadGame();
    }, [id]);

    const handleStartGame = async () => {
        setSaving(true);
        setError("");
        setMessage("");
        try {
            await startGame(id);
            setMessage("Игра начата");
            loadGame();
        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка при старте игры");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePlayerField = (index, field, value) => {
        setEditablePlayers((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const handleSaveResults = async () => {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            await saveGameResults(id, {
                players: editablePlayers,
                notes,
            });
            setMessage("Результаты сохранены");
            loadGame();
        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка при сохранении результатов");
        } finally {
            setSaving(false);
        }
    };

    const handleFinalize = async () => {
        if (!window.confirm("Финализировать игру? После этого статистика будет пересчитана.")) {
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            // логика такая: сначала убеждаемся, что результаты сохранены
            await saveGameResults(id, {
                players: editablePlayers,
                notes,
            });
            await finalizeGame(id);
            setMessage("Игра финализирована. Статистика будет обновлена.");
            loadGame();
        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка при финализации игры");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="card">
                <p className="text-muted">Загрузка игры...</p>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="card">
                <p className="text-muted">Игра не найдена.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h1 className="card-title">Игра #{game.id}</h1>
                <span className="badge">
          {GAME_STATUS_LABELS[game.status] || game.status}
        </span>
            </div>

            <p className="text-muted">
                Дата: <strong>{formatDateTime(game.date)}</strong>
            </p>
            <p className="text-muted">
                Место: <strong>{game.place}</strong>
            </p>

            <div className="chip-row" style={{ marginTop: 8 }}>
                <span className="chip">Игроков: {game.players?.length ?? 0}</span>
                {isFinalized && <span className="chip">В статистику уже учтена</span>}
            </div>

            {error && (
                <p className="text-small" style={{ color: "#ff8080", marginTop: 12 }}>
                    {error}
                </p>
            )}
            {message && (
                <p className="text-small" style={{ color: "#80ff80", marginTop: 12 }}>
                    {message}
                </p>
            )}

            {/* Управление для ведущего */}
            {isGameMaster && (
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                    {game.status === "PLANNED" && (
                        <button
                            className="button"
                            onClick={handleStartGame}
                            disabled={saving}
                        >
                            {saving ? "Запуск..." : "Начать игру"}
                        </button>
                    )}

                    {game.status === "IN_PROGRESS" && (
                        <button
                            className="button button-secondary"
                            style={{ marginLeft: 8 }}
                            onClick={handleEndGame}
                            disabled={saving}
                        >
                            {saving ? "Завершаем..." : "Закончить игру (результаты позже)"}
                        </button>
                    )}

                    {canEdit && (
                        <>
                            <button
                                className="button button-secondary"
                                style={{ marginLeft: 8 }}
                                onClick={handleSaveResults}
                                disabled={saving}
                            >
                                {saving ? "Сохраняем..." : "Сохранить результаты"}
                            </button>

                            <button
                                className="button"
                                style={{ marginLeft: 8 }}
                                onClick={handleFinalize}
                                disabled={saving}
                            >
                                {saving ? "Финализация..." : "Финализировать игру"}
                            </button>
                        </>
                    )}
                </div>
            )}


            {/* Таблица игроков и результатов */}
            <div style={{ marginTop: 16 }}>
                <h2 className="card-title" style={{ marginBottom: 8 }}>
                    Игроки и результаты
                </h2>

                {game.players?.length === 0 ? (
                    <p className="text-muted">Список игроков пуст.</p>
                ) : (
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Ник</th>
                            <th>Роль</th>
                            <th>Результат</th>
                        </tr>
                        </thead>
                        <tbody>
                        {editablePlayers.map((p, index) => (
                            <tr key={p.playerId || p.nickname || index}>
                                <td>{p.nickname}</td>
                                <td>
                                    {canEdit ? (
                                        <select
                                            value={p.role || ""}
                                            onChange={(e) =>
                                                handleChangePlayerField(
                                                    index,
                                                    "role",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">— не указано —</option>
                                            {AVAILABLE_ROLES.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        p.role || "—"
                                    )}
                                </td>
                                <td>
                                    {canEdit ? (
                                        <select
                                            value={p.outcome || "unknown"}
                                            onChange={(e) =>
                                                handleChangePlayerField(
                                                    index,
                                                    "outcome",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {AVAILABLE_OUTCOMES.map((o) => (
                                                <option key={o} value={o}>
                                                    {o}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        p.outcome || "unknown"
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Заметки по игре */}
            <div style={{ marginTop: 16 }}>
                <h2 className="card-title" style={{ marginBottom: 8 }}>
                    Заметки
                </h2>
                {canEdit ? (
                    <textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="form-group"
                        style={{ width: "100%" }}
                        placeholder="Особенности игры, спорные моменты и т.д."
                    />
                ) : (
                    <p className="text-muted">
                        {notes ? notes : "Нет заметок к игре."}
                    </p>
                )}
            </div>
        </div>
    );
};

export default GameDetailPage;