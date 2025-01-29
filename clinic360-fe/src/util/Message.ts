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

type OutMessage = DraftMessage & SentMessage;

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

export async function getInMessageFrom(preview: InMessagePreview, auth: AuthFunctions): Promise<InMessage> {
    const response = await auth.fetchProtectedData(`message/read/`, {id: preview.id});
    if (response.hasError) {
        throw new Error("Unable to read message");
    }
    const content = response.data.content as string;
    return {
        ...preview,
        content,
    };
}

export async function getOutMessageFrom(preview: OutMessagePreview, auth: AuthFunctions): Promise<OutMessage> {
    const response = await auth.fetchProtectedData(`message/read/`, {id: preview.id});
    if (response.hasError) {
        throw new Error("Unable to read message");
    }
    const content = response.data.content as string;
    const recipient_id = response.data.recipient_id as number | null;
    return {
        ...preview,
        recipient_id,
        content,
    };
}

export async function getMessageFrom(preview: MessagePreview, auth: AuthFunctions): Promise<Message> {
    if ("recipient" in preview) {
        return await getOutMessageFrom(preview, auth);
    } else {
        return await getInMessageFrom(preview, auth);
    }
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
    const response = await auth.fetchProtectedData("message/draft/");
    if (response.hasError) {
        console.error("Failed to fetch draft messages");
        return [];
    }
    const messages = response.data.messages as OutApiMessage[];
    return messages.map(message => ({
        ...message,
        read: true,
        date: new Date(message.timestamp),
    }));
}

export async function sendOrSaveMessage(message: DraftMessage, saveDraft: boolean, auth: AuthFunctions): Promise<DraftMessage> {
    const payload = {
        recipient: message.recipient_id,
        subject: message.subject,
        content: message.content,
    }
    if (message.id === null) {
        const response = saveDraft ?
            await auth.fetchProtectedData("message/draft/create/", payload)
        :
            await auth.fetchProtectedData("message/create/", payload);
        if (response.hasError) {
            throw new Error("Failed to send or save message");
        }
        if (saveDraft) {
            return {...message, id: response.data.id};
        }
    } else {
        const response = saveDraft ?
            await auth.fetchProtectedData("message/draft/update/", {...payload, id: message.id})
        :
            await auth.fetchProtectedData("message/draft/send/", {...payload, id: message.id});
        if (response.hasError) {
            throw new Error("Failed to send or save message");
        }
    }
    return message;
}

export async function getContacts(auth: AuthFunctions) {
    const response = await auth.fetchProtectedData("message/contacts/");
    if (response.hasError) {
        console.error("Failed to fetch contacts");
        return [];
    }
    return response.data.contacts as Contact[];
}