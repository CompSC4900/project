import React, { useState, ChangeEvent } from "react"
import { Contact, DraftMessage } from "../util/Message";

interface MessageMetadata {
    message: DraftMessage
    unsavedChanges: boolean
    lastSaved: Date | undefined
}

interface Props {
    messageMetadata: MessageMetadata
    setMessageMetadata: React.Dispatch<React.SetStateAction<MessageMetadata | null>>
    contacts: Contact[]
    saveDraft(): void
    send(): void
}

export default function MessageEditor({messageMetadata, setMessageMetadata, contacts, saveDraft, send}: Props) {
    const [errorMessage, setErrorMessage] = useState("");

    function handleChange(field: keyof DraftMessage, value: DraftMessage[typeof field]) {
        setMessageMetadata((prev) => (prev && {
            ...prev,
            message: {...messageMetadata.message, [field]: value},
            unsavedChanges: true,
        }));
    }

    function changeHandlerFactory(field: "subject" | "content") {
        return (
            (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleChange(field, event.target.value)
        );
    }

    function getLastSavedMessage() {
        if (!messageMetadata.unsavedChanges) {
            return "Saved";
        } else if (messageMetadata.lastSaved === undefined) {
            return "Not Saved";
        } else {
            return `Last Saved ${messageMetadata.lastSaved.toLocaleTimeString(undefined, {hour: "numeric", minute: "numeric"})}`;
        }
    }

    function handleSend() {
        if (!messageMetadata.message.recipientId) {
            setErrorMessage("Please select a recipient");
        } else if (!messageMetadata.message.subject) {
            setErrorMessage("Subject must not be empty");
        } else if (!messageMetadata.message.content) {
            setErrorMessage("Cannot send an empty message")
        } else {
            send();
        }
    }

    function handleRecipientChange(newRecipient: string) {
        let newRecipientName: string
        let newRecipientId: number | null
        if (newRecipient === "") {
            newRecipientName = "";
            newRecipientId = null;
        } else {
            newRecipientId = parseInt(newRecipient, 10);
            newRecipientName = contacts.find(contact => contact.id === newRecipientId)!.name;
        }
        handleChange("recipient", newRecipientName);
        handleChange("recipientId", newRecipientId);
    }

    function maybeRenderError() {
        if (errorMessage) {
            return <div className="alert alert-danger py-2 m-3">{errorMessage}</div>;
        }
    }

    return (
        <>
            <div className="d-flex">
                <div className="flex-grow-1">
                    <div className="d-flex mx-3 my-2">
                        <label className="fw-bold me-1" id="recipient">To:</label>
                        <select
                            onChange={e => handleRecipientChange(e.target.value)}
                            value={messageMetadata.message.recipientId === null ? "" : messageMetadata.message.recipientId}
                        >
                            <option value="">—</option>
                            {contacts.map(contact =>
                                <option key={contact.id} value={contact.id}>{contact.name}</option>
                            )}
                        </select>
                    </div>
                    <hr className="m-0"/>
                    <div className="d-flex mx-3 my-2">
                        <label className="fw-bold me-1" id="subject">Subject: </label>
                        <input 
                            className="form-control d-inline border-0 px-1 py-0" 
                            type="text" 
                            placeholder="Subject" 
                            aria-describedby="subject"
                            onChange={changeHandlerFactory("subject")}
                            value={messageMetadata.message.subject}
                        />
                    </div>
                </div>
                <div className="vr" />
                <div className="d-flex flex-column align-self-start m-2">
                    <div className="d-flex">
                        <button
                            className="btn btn-primary me-2"
                            onClick={saveDraft}
                        >
                            Save Draft
                        </button>
                        <button
                            className="btn btn-primary bi-send"
                            onClick={handleSend}
                        />
                    </div>
                    <small className="mt-1">{getLastSavedMessage()}</small>
                </div>
            </div>
            <hr className="m-0" />
            {maybeRenderError()}
            <textarea
                className="px-3 py-2 overflow-y-auto flex-grow-1 border-0"
                onChange={changeHandlerFactory("content")}
                value={messageMetadata.message.content}
            />
        </>
    );
}