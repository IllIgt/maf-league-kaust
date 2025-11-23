import React, { useEffect, useState } from "react";
import { fetchWeekSlots, submitGamePreferences } from "../api";

const GAME_MIN_PLAYERS = 10;

// Мок на случай отсутствия бэка
const today = new Date();
const addDays = (d, n) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
};
const formatISODate = (d) =>
    d.toISOString().slice(0, 10); // YYYY-MM-DD

const mockSlots = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(today, i + 1); // "следующая неделя" - можно поправить под свою логику
    return {
        date: formatISODate(date),
        playersCount: Math.floor(Math.random() * 15),
    };
});

const formatDateHuman = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    });
};

const GameRegistrationPage = () => {
    const [slots, setSlots] = useState([]);
    const [selectedDates, setSelectedDates] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchWeekSlots()
            .then((data) => {
                setSlots(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setSlots(mockSlots);
                setError("Показываем тестовые данные (нет соединения с сервером)");
                setLoading(false);
            });

        // только мок:
        // setTimeout(() => {
        //   setSlots(mockSlots);
        //   setLoading(false);
        // }, 400);
    }, []);

    const toggleDate = (date) => {
        setSelectedDates((prev) => {
            const next = new Set(prev);
            if (next.has(date)) {
                next.delete(date);
            } else {
                next.add(date);
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedDates.size === 0) {
            setMessage("Выберите хотя бы один день.");
            return;
        }

        setSubmitting(true);
        setMessage("");
        setError("");

        try {
            await submitGamePreferences(Array.from(selectedDates));
            setMessage("Ваши предпочтения сохранены!");
        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка при сохранении предпочтений");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h1 className="card-title">Запись на игру (следующая неделя)</h1>
                <span className="badge">Preferences</span>
            </div>

            {loading && <p className="text-muted">Загрузка слотов...</p>}
            {error && <p className="text-small">{error}</p>}

            {!loading && slots.length === 0 && (
                <p className="text-muted">
                    Слоты на следующую неделю ещё не созданы. Свяжитесь с организаторами.
                </p>
            )}

            {!loading && slots.length > 0 && (
                <>
                    <p className="text-muted">
                        Отметьте дни, в которые вы готовы играть. Когда на какой-то день
                        запишется <strong>{GAME_MIN_PLAYERS}</strong> или больше игроков,
                        этот день станет официальной игровой датой и появится на главной.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                gap: "12px",
                                margin: "16px 0",
                            }}
                        >
                            {slots.map((slot) => {
                                const isSelected = selectedDates.has(slot.date);
                                const isGameDay = slot.playersCount >= GAME_MIN_PLAYERS;

                                return (
                                    <label
                                        key={slot.date}
                                        className="card"
                                        style={{
                                            padding: "10px 12px",
                                            cursor: "pointer",
                                            borderColor: isSelected
                                                ? "rgba(255, 255, 255, 0.6)"
                                                : "rgba(255, 255, 255, 0.15)",
                                            backgroundColor: isSelected
                                                ? "rgba(255,255,255,0.06)"
                                                : "rgba(5,5,15,0.9)",
                                        }}
                                    >
                                        <div className="card-header" style={{ marginBottom: 4 }}>
                                            <div className="card-title">
                                                {formatDateHuman(slot.date)}
                                            </div>
                                            {isGameDay && (
                                                <span className="badge">Игровой день</span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginTop: 4,
                                            }}
                                        >
                                            <div className="text-small">
                                                Игроков записано: <strong>{slot.playersCount}</strong>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleDate(slot.date)}
                                            />
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        <button
                            className="button"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? "Сохраняем..." : "Сохранить выбор"}
                        </button>
                    </form>

                    {message && (
                        <p style={{ marginTop: 12 }} className="text-muted">
                            {message}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default GameRegistrationPage;