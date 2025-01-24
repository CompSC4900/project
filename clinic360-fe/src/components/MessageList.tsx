import Message from "../util/Message"
import MessagePreview from "./MessagePreview"

interface Props {
    messages: Message[]
    displayedUser: "recipient" | "sender"
    selectedMessageId: number | null
    onMessageSelected(message: Message): void
}

export default function MessageList({messages, displayedUser, selectedMessageId, onMessageSelected}: Props) {
    const sortedMessages = [...messages].sort()

    return (
        <ul className="list-group w-100 overflow-y-auto">
            {sortedMessages.map((message) => (
                <MessagePreview
                    user={message[displayedUser]}
                    message={message}
                    active={selectedMessageId === message.id}
                    onSelected={() => onMessageSelected(message)}
                    key={message.id}
                />
            ))}
        </ul>
    )
}