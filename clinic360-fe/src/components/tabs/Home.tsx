import Calendar from "../calendar/Calendar"
import MessageList from "../MessageList"
import Message from "../../util/Message"
import { getSampleMessages } from "../../util/Message"
import { useState } from "react"
import MessageDisplay from "../MessageDisplay"
import Popup from "../Popup"

interface Props {
    setActiveTab(tab: string): void
}

export default function Home({setActiveTab}: Props) {
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

    const messages = getSampleMessages(5);
    const message = selectedMessageId ? messages.find(message => message.id === selectedMessageId) : undefined;

    const event = {
        title: "test",
        time: new Date(),
        color: "var(--bs-primary)",
        allDay: false,
    };

    function handleMessageSelected(message: Message) {
        setSelectedMessageId(message.id);
    }

    return (
        <>
            <div className="me-5 p-3 w-50 h-100 card">
                <h2>Appointments</h2>
                <hr />
                <Calendar events={[event]} />
                <button
                    className="btn btn-primary mt-3 align-self-center"
                    onClick={() => setActiveTab("Scheduling")}
                >
                    Schedule an Appointment
                </button>
            </div>
            <div className="p-3 w-50 h-100 card">
                <h2 className="mb-3">Recent Messages</h2>
                <MessageList
                    messages={messages}
                    displayedUser="sender"
                    selectedMessageId={selectedMessageId}
                    onMessageSelected={handleMessageSelected}
                />
                <button
                    className="btn btn-primary align-self-center mt-3"
                    onClick={() => setActiveTab("Messages")}
                >
                    See More
                </button>
            </div>
            <Popup
                shown={selectedMessageId !== null}
                onDismiss={() => setSelectedMessageId(null)}
            >
                {selectedMessageId !== null && <MessageDisplay message={message!} selfRecipient={false} />}
            </Popup>
        </>
    );
}