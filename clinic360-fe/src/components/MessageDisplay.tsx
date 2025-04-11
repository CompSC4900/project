import { useEffect, useState } from "react";
import { getMessageFrom, Message, MessagePreview } from "../util/Message";
import { useAuth } from "./AuthContext";
import DOMPurify from "dompurify";

interface Props {
    messagePreview: MessagePreview
}

export default function MessageDisplay({messagePreview}: Props) {
    const auth = useAuth();
    const [message, setMessage] = useState<Message | null>(null);

    useEffect(() => {
        (async () => setMessage(await getMessageFrom(messagePreview, auth)))();
    }, [messagePreview]);

    function renderSenderOrReciever(message: Message) {
        if ("recipient" in message) {
            return <><b>To: </b>{message.recipient}</>
        } else {
            return <><b>From: </b>{message.sender}</>
        }
    }

    if (message) {
        /* For things like bold/italicized text, lists, and line spacing, this version of the message
         * display will keep the format.
         * DOMPurify is uesd to limit the tags that can be used and prevent XSS attacks by stripping
         * malicious HTML/script tags
        */
        const cleanHTML = DOMPurify.sanitize(
            message.content.replace(/\n/g, "<br>"),
            {
            ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'ul', 'ol', 'li', 'img', 'div'],
            ALLOWED_ATTR: ['src', 'alt', 'style'],
        });

        return (
            <>
                <div className="mx-3 my-2">{renderSenderOrReciever(message)}</div>
                <hr className="m-0" />
                <div className="mx-3 my-2">
                    <b>Subject: </b>{message.subject}
                </div>
                <hr className="m-0" />
                <div
                    className="mx-3 my-2 overflow-y-auto flex-grow-1"
                    dangerouslySetInnerHTML={{ __html: cleanHTML }}
                />
            </>
        );
    }
}