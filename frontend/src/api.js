const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// как и раньше, поменяешь на свой

export async function fetchLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error("Не удалось загрузить таблицу лидеров");
    return res.json();
}

export async function fetchCurrentPlayer() {
    const res = await fetch(`${API_BASE}/me`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Не удалось загрузить данные игрока");
    return res.json();
}

// ---------- НОВОЕ: AUTH ----------

export async function registerUser({ nickname, email, password }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, email, password }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Ошибка при регистрации");
    }

    return res.json(); // тут ты можешь вернуть юзера или просто `{ok:true}`
}

export async function loginUser({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Ошибка при входе");
    }

    return res.json();
}

export async function logoutUser() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Ошибка при выходе");
    }

    return res.json();
}

// ---------- остальное можешь оставить как есть ----------

export async function fetchWeekSlots() {
    const res = await fetch(`${API_BASE}/week-slots`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Не удалось загрузить слоты недели");
    return res.json();
}

export async function submitGamePreferences(dates) {
    const res = await fetch(`${API_BASE}/week-slots/preferences`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ dates }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Не удалось сохранить выбор дней");
    }

    return res.json();
}
export async function fetchGames() {
    const res = await fetch(`${API_BASE}/games`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Не удалось загрузить список игр");
    return res.json();
}

export async function fetchGame(gameId) {
    const res = await fetch(`${API_BASE}/games/${gameId}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Не удалось загрузить данные игры");
    return res.json();
}

export async function startGame(gameId) {
    const res = await fetch(`${API_BASE}/games/${gameId}/start`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Не удалось начать игру");
    }
    return res.json();
}

export async function saveGameResults(gameId, { players, notes }) {
    const res = await fetch(`${API_BASE}/games/${gameId}/results`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players, notes }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Не удалось сохранить результаты");
    }
    return res.json();
}

export async function finalizeGame(gameId) {
    const res = await fetch(`${API_BASE}/games/${gameId}/finalize`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Не удалось финализировать игру");
    }
    return res.json();
}
export async function createGameFromSlot({ date, place }) {
    const res = await fetch(`${API_BASE}/games/from-slot`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, place }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Не удалось создать игру");
    }
    return res.json();
}

export async function endGame(gameId) {
    const res = await fetch(`${API_BASE}/games/${gameId}/end`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Не удалось завершить игру");
    }
    return res.json();
}