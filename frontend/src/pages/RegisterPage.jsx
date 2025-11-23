import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, fetchCurrentPlayer } from "../api";
import { useAuth } from "../AuthContext";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setMessage("");

        try {
            await registerUser({ nickname, email, password });
            // многие бэки сразу логинят после регистрации,
            // но на всякий случай ещё раз дерну /me
            const me = await fetchCurrentPlayer();
            setUser(me);
            setMessage("Регистрация успешна!");
            navigate("/profile");
        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка при регистрации");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
            <div className="card-header">
                <h1 className="card-title">Регистрация</h1>
                <span className="badge">Sign up</span>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Никнейм</label>
                    <input
                        type="text"
                        placeholder="RedFox"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                    />
                    <p className="form-helper">
                        Этот ник будет виден в таблице лидеров.
                    </p>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Пароль</label>
                    <input
                        type="password"
                        placeholder="минимум 6 символов"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <p className="text-small" style={{ color: "#ff8080" }}>
                        {error}
                    </p>
                )}
                {message && (
                    <p className="text-small" style={{ color: "#80ff80" }}>
                        {message}
                    </p>
                )}

                <button
                    className="button"
                    type="submit"
                    disabled={submitting}
                    style={{ width: "100%", marginTop: 8 }}
                >
                    {submitting ? "Отправляем..." : "Зарегистрироваться"}
                </button>
            </form>

            <p className="text-small" style={{ marginTop: 12 }}>
                Уже есть аккаунт?{" "}
                <Link to="/login" className="nav-link">
                    Войти
                </Link>
            </p>
        </div>
    );
};

export default RegisterPage;