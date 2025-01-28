import { useEffect, useState } from "react";
import Choices from "../Choices";
import MessageList from "../MessageList";
import { Contact, DraftMessage, getContacts, getInbox, getSent, MessagePreview, sendMessage } from "../../util/Message";
import MessageDisplay from "../MessageDisplay";
import MessageEditor from "../MessageEditor";
import { useConfirmation } from "../ConfirmationContext";
import { useAuth } from "../AuthContext";

interface InProgressMessage {
    composing: boolean
    unsavedChanges: boolean
}

const INBOX_TYPES = ["Inbox", "Sent", "Drafts"] as const;

export default function Messages() {
    const auth = useAuth();
    const showConfirmation = useConfirmation();

    const [inboxType, setInboxType] = useState<typeof INBOX_TYPES[number]>("Inbox");
    const [selectedMessage, setSelectedMessage] = useState<MessagePreview | null>(null);
    const [inProgressMessage, setInProgressMessage] = useState<InProgressMessage>({composing: false, unsavedChanges: false});
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
                // TODO
                break;
        }
    }

    async function maybeWarnUnsavedChanges() {
        if (inProgressMessage.unsavedChanges) {
            await showConfirmation("Your unsaved changes will be lost.");
        }
    }

    function handleInboxTypeChange(newInboxType: string) {
        setSelectedMessage(null);
        setInboxType(newInboxType as typeof inboxType);
    }

    function handleNewMessage() {
        maybeWarnUnsavedChanges().then(() => {
            setSelectedMessage(null);
            setInProgressMessage({composing: true, unsavedChanges: false});
        }).catch(() => {});
    }

    function handleMessageSelected(message: MessagePreview) {
        maybeWarnUnsavedChanges().then(() => {
            setSelectedMessage(message);
            if (!message.read) {
                setMessages(messages.map(oldMessage => {
                    if (oldMessage.id === message.id) {
                        return {...oldMessage, read: true};
                    }
                    return oldMessage;
                }));
            }
            setInProgressMessage({composing: false, unsavedChanges: false});
        }).catch(() => {});
    }

    async function send(message: DraftMessage) {
        setInProgressMessage({composing: false, unsavedChanges: false});
        await sendMessage(message, auth);
        if (inboxType === "Sent") {
            fetchMessages();
        }
    }

    function saveDraft(message: DraftMessage) {
        setInProgressMessage({...inProgressMessage, unsavedChanges: false});
        // TODO
    }

    function maybeRenderMessage() {
        if (selectedMessage) {
            return (
                <MessageDisplay
                    messagePreview={selectedMessage}
                />
            );
        } else if (inProgressMessage.composing) {
            return (
                <MessageEditor
                    contacts={contacts}
                    notifyUnsavedChanges={() => setInProgressMessage({...inProgressMessage, unsavedChanges: true})}
                    send={send}
                    saveDraft={saveDraft}
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