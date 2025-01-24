import { useState } from "react";
import Choices from "../Choices";
import MessageList from "../MessageList";
import { DraftMessage, Message, getSampleMessages } from "../../util/Message";
import MessageDisplay from "../MessageDisplay";
import MessageEditor from "../MessageEditor";
import { useConfirmation } from "../ConfirmationContext";

interface InProgressMessage {
    composing: boolean
    unsavedChanges: boolean
}

const INBOX_TYPES = ["Inbox", "Sent", "Drafts"] as const;

export default function Messages() {
    const [inboxType, setInboxType] = useState<typeof INBOX_TYPES[number]>("Inbox");
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const [inProgressMessage, setInProgressMessage] = useState<InProgressMessage>({composing: false, unsavedChanges: false});
    const showConfirmation = useConfirmation();

    const messages = getSampleMessages(10);

    // returns true on action cancelation
    async function maybeWarnUnsavedChanges() {
        if (inProgressMessage.unsavedChanges) {
            await showConfirmation("Your unsaved changes will be lost.");
        }
    }

    function handleInboxTypeChange(newInboxType: string) {
        setSelectedMessageId(null);
        setInboxType(newInboxType as typeof inboxType);
    }

    function handleNewMessage() {
        maybeWarnUnsavedChanges().then(() => {
            setSelectedMessageId(null);
            setInProgressMessage({composing: true, unsavedChanges: false});
        }).catch(() => {});
    }

    function handleMessageSelected(message: Message) {
        maybeWarnUnsavedChanges().then(() => {
            setSelectedMessageId(message.id);
            setInProgressMessage({composing: false, unsavedChanges: false});
        }).catch(() => {});
    }

    function send(message: DraftMessage) {
        setInProgressMessage({composing: false, unsavedChanges: false});
        // TODO
    }

    function saveDraft(message: DraftMessage) {
        setInProgressMessage({...inProgressMessage, unsavedChanges: false});
        // TODO
    }

    function maybeRenderMessage() {
        if (selectedMessageId !== null) {
            return (
                <MessageDisplay
                    message={messages.find(m => m.id === selectedMessageId)!}
                    selfRecipient={inboxType === "Sent"}
                />
            );
        } else if (inProgressMessage.composing) {
            return (
                <MessageEditor
                    notifyUnsavedChanges={() => setInProgressMessage({...inProgressMessage, unsavedChanges: true})}
                    send={send}
                    saveDraft={saveDraft}
                />
            );
        }
    }

    return (
        <>
            <div className="me-5 h-100 card" style={{width: "33%"}}>
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
                    displayedUser={inboxType === "Inbox" ? "sender" : "recipient"}
                    selectedMessageId={selectedMessageId}
                    onMessageSelected={handleMessageSelected}
                />
            </div>
            <div className="h-100 card" style={{width: "67%"}}>
                {maybeRenderMessage()}
            </div>
        </>
    );
}