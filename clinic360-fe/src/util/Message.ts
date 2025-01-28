import { AuthFunctions } from "../components/AuthContext";

export interface BaseMessagePreview {
    subject: string
    date: Date
    read: boolean
    id: number
}

export interface InMessagePreview extends BaseMessagePreview {
    sender: string
}

export interface OutMessagePreview extends BaseMessagePreview {
    recipient: string
    read: true
}

export type MessagePreview = InMessagePreview | OutMessagePreview;

export interface BaseMessage {
    subject: string
    content: string
    id: number | null
}

export interface InMessage extends BaseMessage {
    sender: string
    id: number
}

export interface SentMessage extends BaseMessage {
    recipient: string
    id: number
}

export type Message = InMessage | SentMessage;

export interface DraftMessage extends BaseMessage {
    recipient: string
    recipient_id: number | null
}

export interface Contact {
    name: string,
    id: number,
}

interface BaseApiMessage {
    subject: string
    timestamp: string
    id: number
}

interface InApiMessage extends BaseApiMessage {
    read: boolean
    sender: string
}

interface OutApiMessage extends BaseApiMessage {
    recipient: string
}

export function DraftMessage(): DraftMessage {
    return {
        recipient: "",
        recipient_id: null,
        subject: "",
        content: "",
        id: null,
    };
}

export async function getMessageFrom<T extends MessagePreview>(
    preview: T,
    auth: AuthFunctions
): Promise<T extends InMessagePreview ? InMessage : SentMessage> {
    const response = await auth.fetchProtectedData(`message/read/`, {id: preview.id});
    if (response.hasError) {
        throw new Error("Unable to read message");
    }
    const content = response.data.content as string;
    return {
        ...preview,
        content,
    } as any;
}

export async function getInbox(auth: AuthFunctions, recents = false): Promise<InMessagePreview[]> {
    const response = await auth.fetchProtectedData(recents ? "message/recent/" : "message/inbox/");
    if (response.hasError) {
        console.error("Failed to fetch inbox");
        return [];
    }
    const messages = response.data.messages as InApiMessage[];
    return messages.map(message => ({
        ...message,
        date: new Date(message.timestamp),
    }));
}

export async function getSent(auth: AuthFunctions): Promise<OutMessagePreview[]> {
    const response = await auth.fetchProtectedData("message/sent/");
    if (response.hasError) {
        console.error("Failed to fetch sent messages");
        return [];
    }
    const messages = response.data.messages as OutApiMessage[];
    return messages.map(message => ({
        ...message,
        read: true,
        date: new Date(message.timestamp),
    }));
}

export async function getDrafts(auth: AuthFunctions): Promise<OutMessagePreview[]> {
    // TODO
    return [];
}

export async function sendMessage(message: DraftMessage, auth: AuthFunctions) {
    if (message.recipient_id === null) {
        return;
    }

    const payload = {
        recipient: message.recipient_id,
        subject: message.subject,
        content: message.content,
    }
    const response = await auth.fetchProtectedData("message/create/", payload);
    if (response.hasError) {
        throw new Error("Failed to send message");
    }

    if (message.id !== null) {
        const response = await auth.fetchProtectedData("message/draft/delete/", {id: message.id});
        if (response.hasError) {
            console.error("Failed to delete draft of sent message");
        }
    }
}

export async function getContacts(auth: AuthFunctions) {
    const response = await auth.fetchProtectedData("message/contacts/");
    if (response.hasError) {
        console.error("Failed to fetch contacts");
        return [];
    }
    return response.data.contacts as Contact[];
}