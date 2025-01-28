import { useState, ChangeEvent } from "react"
import { Contact, DraftMessage } from "../util/Message";

interface Props {
    contacts: Contact[]
    notifyUnsavedChanges(): void
    saveDraft(message: DraftMessage): void
    send(message: DraftMessage): void
}

export default function MessageEditor({contacts, notifyUnsavedChanges, saveDraft, send}: Props) {
    const [message, setMessage] = useState(DraftMessage());
    const [saved, setSaved] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState("");

    function changeHandlerFactory(field: keyof DraftMessage) {
        return (
            (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                setSaved(false);
                setMessage({...message, [field]: event.target.value});
                notifyUnsavedChanges();
            }
        );
    }

    function getLastSavedMessage() {
        if (saved) {
            return "Saved";
        } else if (lastSaved === undefined) {
            return "Not Saved";
        } else {
            return `Last Saved ${lastSaved.toLocaleTimeString(undefined, {hour: "numeric", minute: "numeric"})}`;
        }
    }

    function handleSaveDraft() {
        setLastSaved(new Date());
        setSaved(true);
        saveDraft(message);
    }

    function handleSend() {
        if (!message.recipient) {
            setErrorMessage("Please select a recipient");
        } else if (!message.subject) {
            setErrorMessage("Subject must not be empty");
        } else {
            send(message);
        }
    }

    function handleRecipientChange(newRecipientJson: string) {
        if (newRecipientJson === "") {
            setMessage({...message, recipient: "", recipient_id: null})
            return;
        }
        const newRecipient = JSON.parse(newRecipientJson) as Contact;
        setMessage({...message, recipient: newRecipient.name, recipient_id: newRecipient.id});
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
                        >
                            <option value="">—</option>
                            {contacts.map(contact =>
                                <option key={contact.id} value={JSON.stringify(contact)}>{contact.name}</option>
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
                        />
                    </div>
                </div>
                <div className="vr" />
                <div className="d-flex flex-column align-self-start m-2">
                    <div className="d-flex">
                        <button
                            className="btn btn-primary me-2"
                            onClick={handleSaveDraft}
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
            />
        </>
    );
}