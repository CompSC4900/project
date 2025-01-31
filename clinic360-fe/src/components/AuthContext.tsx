import { createContext, ReactNode, useState, useContext, useCallback, useMemo } from "react";
import { FetchResult, apiBase, fetchData } from "../util/auth";
import Accounts from "./Accounts";

export interface AuthFunctions {
    fetchProtectedData(endpoint: string, method: string, data?: any): Promise<FetchResult>
    logout(): void
    login(email: string, password: string): Promise<void>
}

interface Authorization extends AuthFunctions {
    authorized: true
    accessToken: string
    refreshToken: string
}

interface Unauthorization extends AuthFunctions {
    authorized: false
}

type AuthContextType = Authorization | Unauthorization

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [tokens, setTokens] = useState(() => {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        return {
            accessToken,
            refreshToken,
        };
    });

    const logout = useCallback(() => {
        if (!tokens.accessToken) {
            throw new Error("Request to log out while not authenticated");
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setTokens({accessToken: null, refreshToken: null});
    }, [tokens.accessToken]);

    const login = useCallback(async (email: string, password: string) => {
        const response = await fetch(apiBase + "token/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            setTokens({
                accessToken: data.access,
                refreshToken: data.refresh
            });
        } else {
            if (response.status === 401) {
                throw new Error("Invalid username or password");
            }

            throw new Error("Login failed");
        }
    }, []);

    const refreshToken = useCallback(async () => {
        if (!tokens.refreshToken) {
            throw new Error("Tokens are in a broken state");
        }
        const response = await fetch(apiBase + "token/refresh/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: tokens.refreshToken,
            }),
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("access_token", data.access);
            setTokens({...tokens, accessToken: data.access});
            return data.access as string;
        }
    }, [tokens.refreshToken]);

    const fetchProtectedData = useCallback(async (endpoint: string, method: string, data?: any, retryUsingToken?: string) => {
        if (!tokens.accessToken) {
            throw new Error("Request to access protected data while not authenticated");
        }

        const token = retryUsingToken || tokens.accessToken;
        const response = await fetchData(endpoint, method, data, {"Authorization": `Bearer ${token}`});

        if (response.errorCode === 401 && !retryUsingToken) {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                return await fetchProtectedData(endpoint, method, data, newAccessToken);
            }
        }
        return response;
    }, [tokens.accessToken, refreshToken]);

    const contextValue = useMemo<AuthContextType>(() => {
        if (tokens.accessToken && tokens.refreshToken) {
            return {
                authorized: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                fetchProtectedData,
                logout,
                login,
            };
        } else {
            return {
                authorized: false,
                fetchProtectedData,
                logout,
                login,
            };
        }
    }, [tokens, fetchProtectedData, logout, login]);

    return (
        <AuthContext.Provider value={contextValue}>
            {contextValue.authorized ? children : <Accounts />}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthFunctions {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return {
        fetchProtectedData: context.fetchProtectedData,
        logout: context.logout,
        login: context.login,
    };
}