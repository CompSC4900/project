import { AuthFunctions } from "../components/AuthContext";

export interface FetchResult {
    errorCode: number | null
    data?: any
    error?: any
}

export const apiBase = "http://localhost:8000/api/";

export async function fetchData(endpoint: string, method: string, data?: any, extraHeaders?: Record<string, string>, sendAsFormData: boolean = false): Promise<FetchResult> {
    let headers = extraHeaders || {};
    let body: any;

    if (data) {
        if (sendAsFormData) {
            body = new FormData();
            for (const key in data) {
                body.append(key, data[key]);
            }
        } else {
            headers = {...headers, "Content-Type": "application/json"};
            body = JSON.stringify(data);
        }
    }

    const response = await fetch(apiBase + endpoint, {
        method,
        headers,
        body,
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