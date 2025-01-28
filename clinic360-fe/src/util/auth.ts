import { AuthFunctions } from "../components/AuthContext";

export interface FetchResult {
    hasError: boolean
    data?: any
    error?: any
}

export const apiBase = "http://localhost:8000/api/";

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

export function expectSuccess(response: FetchResult, auth: AuthFunctions) {
    if (response.hasError) {
        console.error("Logging out user because an unexpected server error occured");
        auth.logout();
    }
}