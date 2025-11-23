import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { fetchWeekSlots } from "../api";

const GAME_MIN_PLAYERS = 10;

const formatDateHuman = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    });
};

const HomePage = () => {
    const { user } = useAuth();
    const [gameDays, setGameDays] = useState([]);
    const [loadingDays, setLoadingDays] = useState(true);
    const [creatingDate, setCreatingDate] = useState("");
    const [createError, setCreateError] = useState("");
    const isGameMaster = user?.roles?.includes("GameMaster");

    useEffect(() => {
        fetchWeekSlots()
            .then((slots) => {
                const games = slots.filter(
                    (s) => s.playersCount >= GAME_MIN_PLAYERS
                );
                setGameDays(games);
                setLoadingDays(false);
            })
            .catch((err) => {
                console.error(err);
                setLoadingDays(false);
            });
    }, []);

    const handleCreateGame = async (date) => {
        setCreatingDate(date);
        setCreateError("");
        try {
            // можно дополнительно спросить место (prompt или отдельная форма)
            await createGameFromSlot({ date, place: "KAUST, Discovery Square" });
            // после создания игры можно сделать редирект на /games
            // или просто показать сообщение
            // здесь для простоты — просто алерт:
            alert("Игра создана для " + date);
        } catch (err) {
            console.error(err);
            setCreateError(err.message || "Ошибка при создании игры");
        } finally {
            setCreatingDate("");
        }
    };

    return (
        <>
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">Добро пожаловать в Maf Kaust League</h1>
                    <span className="badge">KAUST Mafia Club</span>
                </div>
                <p className="text-muted">
                    Здесь мы ведём рейтинг игроков клуба мафии, следим за статистикой и
                    помогаем записаться на ближайшие игры. Собирай очки, поднимайся в
                    таблице лидеров и докажи, что ты лучший мафиози или шериф кампуса.
                </p>
                <div className="chip-row" style={{ marginTop: 8 }}>
                    <span className="chip">Рейтинг игроков</span>
                    <span className="chip">История игр</span>
                    <span className="chip">Онлайн-регистрация</span>
                </div>
            </div>

            <div className="grid-two">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Таблица лидеров</h2>
                    </div>
                    <p className="text-muted">
                        Посмотри, кто сейчас в топе по очкам. Используем рейтинг по
                        результатам официальных игр клуба.
                    </p>
                    <Link to="/leaderboard">
                        <button className="button" style={{ marginTop: 8 }}>
                            Открыть таблицу лидеров
                        </button>
                    </Link>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Ближайшие игры</h2>
                    </div>
                    {!loadingDays && gameDays.length > 0 && (
                        <>
                            <p className="text-muted">
                                Следующие потенциальные игровые дни (≥ {GAME_MIN_PLAYERS} записанных игроков):
                            </p>
                            {createError && (
                                <p className="text-small" style={{ color: "#ff8080" }}>
                                    {createError}
                                </p>
                            )}
                            <ul className="text-small" style={{ paddingLeft: 18 }}>
                                {gameDays.map((g) => (
                                    <li key={g.date} style={{ marginBottom: 6 }}>
                                        {formatDateHuman(g.date)} — игроков:{" "}
                                        <strong>{g.playersCount}</strong>
                                        {isGameMaster && (
                                            <button
                                                className="button button-secondary"
                                                style={{ marginLeft: 8, padding: "2px 8px", fontSize: "0.75rem" }}
                                                onClick={() => handleCreateGame(g.date)}
                                                disabled={creatingDate === g.date}
                                            >
                                                {creatingDate === g.date ? "Создаём..." : "Создать игру"}
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    <Link to="/games/register">
                        <button className="button button-secondary" style={{ marginTop: 8 }}>
                            Отметить дни, когда могу играть
                        </button>
                    </Link>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Личный кабинет игрока</h2>
                </div>
                <p className="text-muted">
                    Когда бэкенд будет готов, здесь можно будет войти под своим аккаунтом
                    (например, по KAUST email или Telegram-логину) и увидеть подробную
                    статистику по играм.
                </p>
                <Link to="/profile">
                    <button className="button button-secondary" style={{ marginTop: 8 }}>
                        Перейти в кабинет
                    </button>
                </Link>
            </div>
        </>
    );
};

export default HomePage;