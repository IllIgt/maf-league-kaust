import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const NavBar = () => {
    const { user, logout, loading } = useAuth();

    return (
        <header className="navbar">
            <div className="navbar-title">
                <Link to="/">Maf Kaust League</Link>
            </div>
            <nav className="navbar-links">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                    }
                >
                    Главная
                </NavLink>
                <NavLink
                    to="/leaderboard"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                    }
                >
                    Таблица лидеров
                </NavLink>
                <NavLink
                    to="/games"
                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                >
                    Игры
                </NavLink>
                <NavLink
                    to="/games/register"
                    className={({ isActive }) =>
                        "nav-link" + (isActive ? " active" : "")
                    }
                >
                    Записаться на игру
                </NavLink>

                {/* Правый блок: логин/регистрация или ник+выход */}
                {loading ? (
                    <span className="text-small">...</span>
                ) : user ? (
                    <>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            {user.nickname || "Профиль"}
                        </NavLink>
                        <button
                            className="button button-secondary"
                            style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                            onClick={logout}
                        >
                            Выйти
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            Войти
                        </NavLink>
                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                "nav-link" + (isActive ? " active" : "")
                            }
                        >
                            Регистрация
                        </NavLink>
                    </>
                )}
            </nav>
        </header>
    );
};

export default NavBar;