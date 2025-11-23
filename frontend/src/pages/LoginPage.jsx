import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, fetchCurrentPlayer } from "../api";
import { useAuth } from "../AuthContext";

const LoginPage = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await loginUser({ email, password });
            // после успешного логина снова дергаем /me, чтобы получить юзера
            const me = await fetchCurrentPlayer();
            setUser(me);
            navigate("/profile");
        } catch (err) {
            console.error(err);
            setError(err.message || "Ошибка при входе");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
            <div className="card-header">
                <h1 className="card-title">Войти</h1>
                <span className="badge">Login</span>
            </div>

            <form onSubmit={handleSubmit}>
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
                        placeholder="••••••••"
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

                <button
                    className="button"
                    type="submit"
                    disabled={submitting}
                    style={{ width: "100%", marginTop: 8 }}
                >
                    {submitting ? "Входим..." : "Войти"}
                </button>
            </form>

            <p className="text-small" style={{ marginTop: 12 }}>
                Нет аккаунта?{" "}
                <Link to="/register" className="nav-link">
                    Зарегистрироваться
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;