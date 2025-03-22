import { AuthFunctions } from "../components/AuthContext";
import { expectSuccess } from "./auth";

export interface Condition {
    id: number;
    name: string;
}

export interface SocialInfo {
    id: number;
    user: number;
    first_name: string;
    last_name: string;
    about_me: string;
    profile_picture: string | null;
    public: boolean;
    conditions: Condition[];
    friend_request_id?: number;
}

export interface FriendRequest {
    id: number;
    sender_id: number;
    receiver_id: number;
}

export async function getMySocialInfo(auth: AuthFunctions): Promise<SocialInfo[]> {
    const response = await auth.fetchProtectedData('social/self/', 'GET');
    expectSuccess(response, auth);
    return response.data as SocialInfo[];
}

export async function getPatientSocialInfo(auth: AuthFunctions): Promise<SocialInfo[]> {
    const response = await auth.fetchProtectedData(`social/patient/`, 'GET');
    expectSuccess(response, auth);
    return response.data as SocialInfo[];
}

export async function getFriends(auth: AuthFunctions): Promise<number[]> {
    const response = await auth.fetchProtectedData(`social/friends/`, 'GET');
    expectSuccess(response, auth);
    return response.data as number[];
}

export async function getOutgoingFriendRequests(auth: AuthFunctions): Promise<FriendRequest[]> {
    const response = await auth.fetchProtectedData(`social/friends/outgoing/`, 'GET');
    expectSuccess(response, auth);
    return response.data as FriendRequest[];
}

export async function getIncomingFriendRequests(auth: AuthFunctions): Promise<FriendRequest[]> {
    const response = await auth.fetchProtectedData(`social/friends/incoming/`, 'GET');
    expectSuccess(response, auth);
    return response.data as FriendRequest[];
}

export async function sendFriendRequest(auth: AuthFunctions, receiverId: number): Promise<void> {
    const response = await auth.fetchProtectedData(`social/friends/outgoing/`, 'POST', { receiver_id: receiverId });
    expectSuccess(response, auth);
}

export async function acceptFriendRequest(auth: AuthFunctions, requestId: number): Promise<void> {
    const response = await auth.fetchProtectedData(`social/friends/accept/${requestId}/`, 'POST');
    expectSuccess(response, auth);
}

export async function rejectFriendRequest(auth: AuthFunctions, requestId: number): Promise<void> {
    const response = await auth.fetchProtectedData(`social/friends/incoming/${requestId}/`, 'DELETE');
    expectSuccess(response, auth);
}

export async function cancelFriendRequest(auth: AuthFunctions, requestId: number): Promise<void> {
    const response = await auth.fetchProtectedData(`social/friends/outgoing/${requestId}/`, 'DELETE');
    expectSuccess(response, auth);
}

export async function removeFriend(auth: AuthFunctions, friendId: number): Promise<void> {
    const response = await auth.fetchProtectedData(`social/friends/remove/${friendId}/`, 'POST');
    expectSuccess(response, auth);
}



