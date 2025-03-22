import { AuthFunctions } from "../components/AuthContext";
import { expectSuccess } from "./auth";

export interface Condition {
    id: number;
    name: string;
}

export interface SocialInfo {
    id: number;
    user: number;
    aboutMe: string;
    profilePicture: string;
    public: boolean;
    conditions: Condition[];
}

export interface FriendRequest {
    id: number;
    sender: number;
    receiver: number;
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

export async function getFriends(auth: AuthFunctions): Promise<SocialInfo[]> {
    const response = await auth.fetchProtectedData(`social/friends/`, 'GET');
    expectSuccess(response, auth);
    return response.data as SocialInfo[];
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



