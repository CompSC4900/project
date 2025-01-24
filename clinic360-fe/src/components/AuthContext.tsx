import { createContext, ReactNode, useState, useContext } from "react";
import Accounts from "./Accounts";

interface AuthContextType {
    accessToken: string
    refreshToken: string
    fetchProtectedData(endpoint: string, data?: any): Promise<any>
    logout(): void
    login(email: string, password: string): Promise<void>
}

interface FetchResult {
    hasError: boolean
    data?: any
    error?: any
}

const AuthContext = createContext<AuthContextType | null | undefined>(undefined);
const apiBase = "http://localhost:8000/api/";



export function AuthProvider({ children }: { children: ReactNode }) {
    const [authContext, setAuthContext] = useState<AuthContextType | null>(readTokensFromLocalStorage());

    function logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setAuthContext(null);
    }

    async function login(email: string, password: string) {
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
            setAuthContext({logout, login, fetchProtectedData, accessToken: data.access, refreshToken: data.refresh});
        } else {
            if (response.status === 401) {
                throw new Error("Invalid username or password");
            }

            const error = await response.json();
            if (error.detail) {
                throw new Error(error.detail);
            }
            throw new Error("Login failed");
        }
    }

    function readTokensFromLocalStorage() {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        if (accessToken !== null && refreshToken !== null) {
            return {
                accessToken,
                refreshToken,
                fetchProtectedData,
                logout,
                login,
            };
        } else {
            return null;
        }
    }

    async function refreshToken(): Promise<string | undefined> {
        const response = await fetch(apiBase + "token/refresh/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: authContext!.refreshToken,
            }),
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("access_token", data.access);
            setAuthContext({...authContext!, accessToken: data.access});
            return data.access;
        }
    }

    async function fetchProtectedData(endpoint: string, data?: any, retryUsingToken?: string): Promise<FetchResult> {
        if (!authContext) {
            throw new Error("Request to access protected data while not authenticated");
        }

        const token = retryUsingToken || authContext.accessToken;
        const method = data ? "POST" : "GET";
        const headers: Record<string, string> = {
            "Authorization": `Bearer ${token}`,
        }
        if (data) {
            headers["Content-Type"] = "application/json";
        }
        const response = await fetch(apiBase + endpoint, {
            method,
            headers,
            body: data && JSON.stringify(data),
        });

        if (!response.ok) {
            if (response.status === 401 && !retryUsingToken) {
                const newAccessToken = await refreshToken();
                if (newAccessToken) {
                    return await fetchProtectedData(endpoint, data, newAccessToken);
                }
            }

            return {
                hasError: true,
                error: await response.json(),
            };
        }

        return {
            hasError: false,
            data: await response.json(),
        };
    }

    return (
        <AuthContext.Provider value={authContext}>
            {authContext ? children : <Accounts />}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    } else if (context === null) {
        throw new Error("Request to access AuthContext while not authenticated");
    }
    return {
        fetchProtectedData: context.fetchProtectedData,
        logout: context.logout,
        login: context.login,
    };
}