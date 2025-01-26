import { createContext, ReactNode, useState, useContext } from "react";
import Accounts from "./Accounts";

interface AuthFunctions {
    fetchProtectedData(endpoint: string, data?: any): Promise<FetchResult>
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

interface FetchResult {
    hasError: boolean
    data?: any
    error?: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const apiBase = "http://localhost:8000/api/";


export async function fetchUnprotectedData(endpoint: string, data?: any): Promise<FetchResult> {
    const method = data ? "POST" : "GET";
    const response = await fetch(apiBase + endpoint, {
        method,
        headers: data && {"Content-Type": "application/json"},
        body: data && JSON.stringify(data),
    });

    if (!response.ok) {
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

export function AuthProvider({ children }: { children: ReactNode }) {
    const unauthorized: Unauthorization = {
        authorized: false,
        fetchProtectedData,
        logout,
        login,
    };

    const [authContext, setAuthContext] = useState<AuthContextType>(readTokensFromLocalStorage());

    function logout() {
        if (!authContext.authorized) {
            throw new Error("Request to log out while not authenticated");
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setAuthContext(unauthorized);
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
            setAuthContext({
                authorized: true,
                logout, 
                login, 
                fetchProtectedData, 
                accessToken: data.access, 
                refreshToken: data.refresh
            });
        } else {
            if (response.status === 401) {
                throw new Error("Invalid username or password");
            }

            throw new Error("Login failed");
        }
    }

    function readTokensFromLocalStorage(): AuthContextType {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");
        if (accessToken !== null && refreshToken !== null) {
            return {
                authorized: true,
                accessToken,
                refreshToken,
                fetchProtectedData,
                logout,
                login,
            };
        } else {
            return unauthorized;
        }
    }

    async function refreshToken(): Promise<string | undefined> {
        if (!authContext.authorized) {
            return;
        }
        const response = await fetch(apiBase + "token/refresh/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: authContext.refreshToken,
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
        if (!authContext.authorized) {
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
            {authContext.authorized ? children : <Accounts />}
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