import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import GameRegistrationPage from "./pages/GameRegistrationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GamesListPage from "./pages/GamesListPage";
import GameDetailPage from "./pages/GameDetailPage";

const App = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/games/register" element={<GameRegistrationPage />} />
                <Route path="/games" element={<GamesListPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/history" element={<GameHistoryPage />} />
                <Route path="/game-days/:id" element={<GameDayDetailPage />} />
                <Route path="/games/:id" element={<GameDetailPage />} />
            </Routes>
        </Layout>
    );
};

export default App;