import { useEffect, useState } from "react";
import Choices from "../Choices";
import MessageList from "../MessageList";
import { Contact, DraftMessage, getContacts, getDrafts, getInbox, getOutMessageFrom, getSent, MessagePreview, OutMessagePreview, sendOrSaveMessage } from "../../util/Message";
import MessageDisplay from "../MessageDisplay";
import MessageEditor from "../MessageEditor";
import { useConfirmation } from "../ConfirmationContext";
import { useAuth } from "../AuthContext";

interface InProgressMessage {
    message: DraftMessage
    unsavedChanges: boolean
    lastSaved: Date | undefined
}

const INBOX_TYPES = ["Inbox", "Sent", "Drafts"] as const;

export default function Messages() {
    const newInProgressMessage: InProgressMessage = {
        message: DraftMessage(),
        unsavedChanges: false,
        lastSaved: undefined,
    };

    const auth = useAuth();
    const showConfirmation = useConfirmation();

    const [inboxType, setInboxType] = useState<typeof INBOX_TYPES[number]>("Inbox");
    const [selectedMessage, setSelectedMessage] = useState<MessagePreview | null>(null);
    const [inProgressMessage, setInProgressMessage] = useState<InProgressMessage | null>(null);
    const [messages, setMessages] = useState<MessagePreview[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    useEffect(() => {(async () => setContacts(await getContacts(auth)))()}, []);
    useEffect(() => {fetchMessages()}, [inboxType]);

    async function fetchMessages() {
        setMessages([]);
        switch (inboxType) {
            case "Inbox": {
                setMessages(await getInbox(auth));
                break;
            }
            case "Sent": {
                setMessages(await getSent(auth));
                break;
            }
            case "Drafts":
                setMessages(await getDrafts(auth));
                break;
        }
    }

    async function loadDraft(message: OutMessagePreview) {
        const draft = await getOutMessageFrom(message, auth);
        setInProgressMessage({
            ...newInProgressMessage,
            message: draft,
        });
        setSelectedMessage(message);
    }

    async function maybeWarnUnsavedChanges() {
        if (inProgressMessage && inProgressMessage.unsavedChanges) {
            await showConfirmation("Your unsaved changes will be lost.");
        }
    }

    function handleInboxTypeChange(newInboxType: string) {
        setInboxType(newInboxType as typeof inboxType);
    }

    function handleNewMessage() {
        maybeWarnUnsavedChanges().then(() => {
            setSelectedMessage(null);
            setInProgressMessage(newInProgressMessage);
        }).catch(() => {});
    }

    // TODO: make drafts editable upon selection and make drafts selected while editing them
    function handleMessageSelected(message: MessagePreview) {
        maybeWarnUnsavedChanges().then(() => {
            if (inboxType === "Drafts") {
                loadDraft(message as OutMessagePreview);
            } else {
                setSelectedMessage(message);
                if (!message.read) {
                    setMessages(messages.map(oldMessage => {
                        if (oldMessage.id === message.id) {
                            return {...oldMessage, read: true};
                        }
                        return oldMessage;
                    }));
                }
                setInProgressMessage(null);
            }
        }).catch(() => {});
    }

    async function send() {
        await sendOrSaveMessage(inProgressMessage!.message, false, auth);
        setInProgressMessage(null);
        if (inboxType === "Sent" || (inboxType === "Drafts" && inProgressMessage!.message.id !== null)) {
            fetchMessages();
        }
    }

    async function saveDraft() {
        const newMessage = await sendOrSaveMessage(inProgressMessage!.message, true, auth);
        setInProgressMessage({...inProgressMessage, message: newMessage, unsavedChanges: false, lastSaved: new Date()});
        if (inboxType === "Drafts") {
            fetchMessages();
        }
    }

    function maybeRenderMessage() {
        if (inProgressMessage) {
            return (
                <MessageEditor
                    messageMetadata={inProgressMessage as any}
                    setMessageMetadata={setInProgressMessage}
                    contacts={contacts}
                    send={send}
                    saveDraft={saveDraft}
                />
            );
        } else if (selectedMessage) {
            return (
                <MessageDisplay
                    messagePreview={selectedMessage}
                />
            );
        }
    }

    return (
        <>
            <div className="me-5 h-100 w-33 card">
                <div className="d-flex mx-3 my-2">
                    <Choices
                        choices={INBOX_TYPES} 
                        activeChoice={inboxType}
                        onChange={handleInboxTypeChange} 
                    />
                    <button
                        className="btn btn-primary ms-auto bi-file-earmark-plus"
                        onClick={handleNewMessage}
                    />
                </div>
                <MessageList
                    messages={messages}
                    selectedMessageId={selectedMessage && selectedMessage.id}
                    onMessageSelected={handleMessageSelected}
                />
            </div>
            <div className="h-100 w-67 card">
                {maybeRenderMessage()}
            </div>
        </>
    );
}