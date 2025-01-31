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
    recipientId: number
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
    recipientId: number | null
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
    sender: number
    sender_name: string
}

interface OutApiMessage extends BaseApiMessage {
    recipient: number
    recipient_name: string
}

export function DraftMessage(): DraftMessage {
    return {
        recipient: "",
        recipientId: null,
        subject: "",
        content: "",
        id: null,
    };
}

function apiToInMessagePreview(apiMessage: InApiMessage): InMessagePreview {
    return {
        ...apiMessage,
        sender: apiMessage.sender_name,
        date: new Date(apiMessage.timestamp),
    };
}

function apiToOutMessagePreview(apiMessage: OutApiMessage): OutMessagePreview {
    return {
        ...apiMessage,
        read: true,
        recipient: apiMessage.recipient_name,
        recipientId: apiMessage.recipient,
        date: new Date(apiMessage.timestamp),
    };
}

async function markMessageRead(preview: InMessagePreview, auth: AuthFunctions) {
    const response = await auth.fetchProtectedData(`message/${preview.id}/mark_read/`, "POST");
    if (response.errorCode !== null) {
        console.error("Failed to mark message as read");
    }
}

export async function getInMessageFrom(preview: InMessagePreview, auth: AuthFunctions): Promise<InMessage> {
    const response = await auth.fetchProtectedData(`message/${preview.id}/`, "GET");
    if (response.errorCode !== null) {
        throw new Error("Unable to read message");
    }
    const content = response.data.content as string;
    if (!preview.read) {
        markMessageRead(preview, auth);
    }
    return {
        ...preview,
        content,
    };
}

export async function getOutMessageFrom(preview: OutMessagePreview, auth: AuthFunctions): Promise<OutMessage> {
    const response = await auth.fetchProtectedData(`message/${preview.id}/`, "GET");
    if (response.errorCode !== null) {
        throw new Error("Unable to read message");
    }
    const content = response.data.content as string;
    return {
        ...preview,
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

// TODO: recents
export async function getInbox(auth: AuthFunctions, recents = false): Promise<InMessagePreview[]> {
    const response = await auth.fetchProtectedData("message/inbox/", "GET");
    if (response.errorCode !== null) {
        console.error("Failed to fetch inbox");
        return [];
    }
    const messages = response.data.messages as InApiMessage[];
    if (recents) {
        return messages.map(apiToInMessagePreview).filter(message => Date.now() - message.date.getTime() <= 604800000);
    } else {
        return messages.map(apiToInMessagePreview);
    }
}

export async function getSent(auth: AuthFunctions): Promise<OutMessagePreview[]> {
    const response = await auth.fetchProtectedData("message/sent/", "GET");
    if (response.errorCode !== null) {
        console.error("Failed to fetch sent messages");
        return [];
    }
    const messages = response.data.messages as OutApiMessage[];
    return messages.map(apiToOutMessagePreview);
}

export async function getDrafts(auth: AuthFunctions): Promise<OutMessagePreview[]> {
    const response = await auth.fetchProtectedData("message/drafts/", "GET");
    if (response.errorCode !== null) {
        console.error("Failed to fetch draft messages");
        return [];
    }
    const messages = response.data.messages as OutApiMessage[];
    return messages.map(apiToOutMessagePreview);
}

export async function sendOrSaveMessage(message: DraftMessage, saveDraft: boolean, auth: AuthFunctions): Promise<DraftMessage> {
    const payload = {
        recipient: message.recipientId,
        subject: message.subject,
        content: message.content,
        draft: saveDraft,
    }
    if (message.id === null) {
        const response = await auth.fetchProtectedData("message/", "POST", payload);
        if (response.errorCode !== null) {
            throw new Error("Failed to send or save message");
        }
        return {...message, id: response.data.id};
    } else {
        const response = await auth.fetchProtectedData(`message/${message.id}/`, "PUT", payload);
        if (response.errorCode !== null) {
            throw new Error("Failed to send or save message");
        }
        return message;
    }
}

export async function getContacts(auth: AuthFunctions) {
    const response = await auth.fetchProtectedData("message/contacts/", "GET");
    if (response.errorCode !== null) {
        console.error("Failed to fetch contacts");
        return [];
    }
    return response.data.contacts as Contact[];
}