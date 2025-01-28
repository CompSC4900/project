import { MessagePreview } from "../util/Message"

interface Props {
    message: MessagePreview
    selected: boolean
    onSelected(): void
}

export default function MessagePreviewDisplay({message, selected, onSelected}: Props) {
    const user = "recipient" in message ? message.recipient : message.sender;

    function maybeRenderUnreadNotif() {
        if (!message.read) {
            return (
                <div className="unread-notif position-absolute top-0 end-0 m-3" />
            );
        }
    }

    return (
        <li className={`list-group-item${selected ? " active" : ""}`} onClick={onSelected}>
            <div className="fw-bold">{user}</div>
            <div>{message.subject}</div>
            <small className="text-muted">{message.date.toLocaleString()}</small>
            {maybeRenderUnreadNotif()}
        </li>
    );
}