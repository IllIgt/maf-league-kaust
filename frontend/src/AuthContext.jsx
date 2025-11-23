import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentPlayer, logoutUser } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);     // текущий игрок
    const [loading, setLoading] = useState(true); // загрузка /me
    const [error, setError] = useState("");

    useEffect(() => {
        // при загрузке приложения сразу пытаемся узнать текущего юзера
        fetchCurrentPlayer()
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((err) => {
                console.warn("Не удалось загрузить /me:", err);
                setUser(null);
                setLoading(false);
            });
    }, []);

    const logout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.warn("Ошибка при выходе:", err);
        }
        setUser(null);
    };

    const value = {
        user,
        setUser, // будем вызывать после login/register
        loading,
        error,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth должен использоваться внутри <AuthProvider>");
    }
    return ctx;
};