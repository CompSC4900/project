import { ReactNode } from "react";
import Message from "../util/Message";

interface Props {
    message: Message
    selfRecipient: boolean
    children?: ReactNode
}

export default function MessageDisplay({message, selfRecipient, children}: Props) {
    function renderSenderOrReciever() {
        if (selfRecipient) {
            return <><b>To: </b>{message.recipient}</>
        } else {
            return <><b>From: </b>{message.sender}</>
        }
    }

    return (
        <>
            <div className="mx-3 my-2">
                {renderSenderOrReciever()}
            </div>
            <hr className="m-0" />
            <div className="mx-3 my-2">
                <b>Subject: </b>{message.subject}
            </div>
            <hr className="m-0" />
            <div className="mx-3 my-2 overflow-y-auto flex-grow-1">
                {message.content}
            </div>
            {children}
        </>
    );
}