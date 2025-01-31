import { AuthFunctions } from "../components/AuthContext";

export interface FetchResult {
    errorCode: number | null
    data?: any
    error?: any
}

export const apiBase = "http://localhost:8000/api/";

export async function fetchData(endpoint: string, method: string, data?: any, extraHeaders?: Record<string, string>): Promise<FetchResult> {
    let headers = extraHeaders || {};
    if (data) {
        headers = {...headers, "Content-Type": "application/json"};
    }
    const response = await fetch(apiBase + endpoint, {
        method,
        headers,
        body: data && JSON.stringify(data),
    });

    let responseJson;
    try {
        responseJson = await response.json();
    } catch (e) {}

    if (!response.ok) {
        return {
            errorCode: response.status,
            error: responseJson,
        };
    }

    return {
        errorCode: null,
        data: responseJson,
    };
}

export function expectSuccess(response: FetchResult, auth: AuthFunctions) {
    if (response.errorCode !== null) {
        console.error("Logging out user because an unexpected server error occured");
        auth.logout();
    }
}