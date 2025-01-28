import { MessagePreview } from "../util/Message"
import MessagePreviewDisplay from "./MessagePreviewDisplay"

interface Props {
    messages: MessagePreview[]
    selectedMessageId: number | null
    onMessageSelected(message: MessagePreview): void
}

export default function MessageList({messages, selectedMessageId, onMessageSelected}: Props) {
    const sortedMessages = [...messages].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <ul className="list-group w-100 overflow-y-auto">
            {sortedMessages.map((message) => (
                <MessagePreviewDisplay
                    message={message}
                    selected={selectedMessageId === message.id}
                    onSelected={() => onMessageSelected(message)}
                    key={message.id}
                />
            ))}
        </ul>
    )
}