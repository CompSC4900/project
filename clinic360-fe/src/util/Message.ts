export interface Message {
    sender: string
    recipient: string
    subject: string
    date: Date
    content: string
    read: boolean
    id: number
}

export interface DraftMessage {
    recipient: string
    subject: string
    content: string
}

export function DraftMessage(): DraftMessage {
    return {
        recipient: "",
        subject: "",
        content: "",
    };
}

export function getSampleMessages(n: number): Message[] {
    const defaultMessage = {
        sender: "Sender",
        recipient: "Recipient",
        subject: "Subject",
        date: new Date(),
        content: "Lorem ipsum dolor sit amet.",
        read: false,
    };
    let messages: Message[] = [];
    for (let i = 0; i < n; i++) {
        messages.push({...defaultMessage, id: i});
    }
    return messages;
}

export default Message;