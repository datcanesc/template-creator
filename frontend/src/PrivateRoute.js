import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Yükleniyor...</div>;
    }

    return isAuthenticated ? <Outlet /> : <div>Giriş yapmanız gerekiyor...</div>;
};

export default PrivateRoute;