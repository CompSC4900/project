import { useEffect, useState } from "react";
import { getMessageFrom, Message, MessagePreview } from "../util/Message";
import { useAuth } from "./AuthContext";

interface Props {
    messagePreview: MessagePreview
}

export default function MessageDisplay({messagePreview}: Props) {
    const auth = useAuth();
    const [message, setMessage] = useState<Message | null>(null);

    useEffect(() => {(async () => setMessage(await getMessageFrom(messagePreview, auth)))()}, [messagePreview]);

    function renderSenderOrReciever(message: Message) {
        if ("recipient" in message) {
            return <><b>To: </b>{message.recipient}</>
        } else {
            return <><b>From: </b>{message.sender}</>
        }
    }

    if (message) {
        return (
            <>
                <div className="mx-3 my-2">
                    {renderSenderOrReciever(message)}
                </div>
                <hr className="m-0" />
                <div className="mx-3 my-2">
                    <b>Subject: </b>{message.subject}
                </div>
                <hr className="m-0" />
                <div className="mx-3 my-2 overflow-y-auto flex-grow-1">
                    {message.content}
                </div>
            </>
        );
    }
}