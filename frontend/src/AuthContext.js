import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);

    const usefulRoles = ["admin", "user"]; // İhtiyacımıza uygun roller

    const filterUsefulRoles = (roles) => {
        return roles.filter((role) => usefulRoles.includes(role));
    };

    const redirectToKeycloak = () => {
        const clientId = process.env.REACT_APP_KEYCLOAK_CLIENT;
        const currentSearch = window.location.search;

        if (currentSearch) {
            localStorage.setItem("savedQueryParams", currentSearch);
        }

        const redirectUri = encodeURIComponent(
            `${process.env.REACT_APP_REDIRECT_URI}`
        );

        const authorizationUrl = `${process.env.REACT_APP_KEYCLOAK_HOST}:${process.env.REACT_APP_KEYCLOAK_PORT}/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;

        window.location.href = authorizationUrl;
    };

    const checkTokenValidity = (token) => {
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decodedToken.exp > currentTime;
        } catch (error) {
            console.error("Geçersiz token:", error);
            return false;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedRoles = localStorage.getItem("roles");

        if (token) {
            const isValid = checkTokenValidity(token);
            if (isValid) {
                setIsAuthenticated(true);
                setRoles(storedRoles ? filterUsefulRoles(JSON.parse(storedRoles)) : []);
                setLoading(false);
            } else {
                localStorage.clear();
                redirectToKeycloak();
            }
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const authorizationCode = urlParams.get("code");
            if (authorizationCode) {
                fetchTokenFromBackend(authorizationCode)
                    .then(() => setLoading(false))
                    .catch(() => redirectToKeycloak());
            } else {
                redirectToKeycloak();
            }
        }
    }, []);

    const fetchTokenFromBackend = async (authorizationCode) => {
        const currentPath = window.location.pathname;
        try {
            const response = await axios.post(
                `/token`,
                `code=${authorizationCode}&currentPath=${currentPath}`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const { access_token, refresh_token, id_token, roles } = response.data;
            if (access_token && refresh_token && id_token) {
                const filteredRoles = filterUsefulRoles(roles);
                localStorage.setItem("token", access_token);
                localStorage.setItem("refresh_token", refresh_token);
                localStorage.setItem("id_token", id_token);
                localStorage.setItem("roles", JSON.stringify(filteredRoles));
                setRoles(filteredRoles);
                setIsAuthenticated(true);

                const savedQueryParams = localStorage.getItem("savedQueryParams");
                if (savedQueryParams) {
                    localStorage.removeItem("savedQueryParams");
                    window.history.replaceState(
                        null,
                        "",
                        `${currentPath}${savedQueryParams}`
                    );
                }
            } else {
                redirectToKeycloak();
            }
        } catch (error) {
            setIsAuthenticated(false);
            redirectToKeycloak();
        }
    };

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
            setIsAuthenticated(false);
            redirectToKeycloak();
            return;
        }

        try {
            const response = await axios.post(
                `/token/refresh`,
                `refreshToken=${refreshToken}`,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const { access_token, refresh_token: newRefreshToken } = response.data;
            if (access_token && newRefreshToken) {
                localStorage.setItem("token", access_token);
                localStorage.setItem("refresh_token", newRefreshToken);
                setIsAuthenticated(true);
            } else {
                throw new Error("Token yenilenemedi");
            }
        } catch (error) {
            console.error("Token yenilenemedi:", error);
            setIsAuthenticated(false);
            redirectToKeycloak();
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshToken();
        }, Number(process.env.REACT_APP_REFLESH_TOKEN_TIME));

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (roles.length > 0) {
            console.log("Kullanıcı Rolleri:", roles);
        }
    }, [roles]);

    const logout = () => {
        const idToken = localStorage.getItem("id_token");
        const postLogoutRedirectUri = encodeURIComponent(
            `${process.env.REACT_APP_REDIRECT_URI}`
        );
        window.location.href = `${process.env.REACT_APP_KEYCLOAK_HOST}:${process.env.REACT_APP_KEYCLOAK_PORT}/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${postLogoutRedirectUri}`;

        localStorage.clear();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                roles,
                redirectToKeycloak,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// Kullanıcı Rolünü Kullanma Hook'u
export const useRole = (requiredRole) => {
    const { roles } = useAuth();
    return roles.includes(requiredRole);
};
