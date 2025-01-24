import Message from "../util/Message"

interface Props {
    user: string
    message: Message
    active: boolean
    onSelected(): void
}

export default function MessagePreview({user, message, active, onSelected}: Props) {
    function maybeRenderUnreadNotif() {
        if (!message.read) {
            return (
                <div className="unread-notif position-absolute top-0 end-0 m-3" />
            );
        }
    }

    return (
        <li className={`list-group-item${active ? " active" : ""}`} onClick={onSelected}>
            <div className="fw-bold">{user}</div>
            <div>{message.subject}</div>
            <small className="text-muted">{message.date.toLocaleString()}</small>
            {maybeRenderUnreadNotif()}
        </li>
    );
}