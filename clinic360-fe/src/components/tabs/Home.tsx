import Calendar from "../calendar/Calendar"
import MessageList from "../MessageList"
import { getInbox, InMessagePreview, MessagePreview } from "../../util/Message"
import { useEffect, useState } from "react"
import MessageDisplay from "../MessageDisplay"
import Popup from "../Popup"
import { useAuth } from "../AuthContext"

interface Props {
    setActiveTab(tab: string): void
}

export default function Home({setActiveTab}: Props) {
    const auth = useAuth();
    const [selectedMessage, setSelectedMessage] = useState<InMessagePreview | null>(null);
    const [messages, setMessages] = useState<InMessagePreview[]>([]);

    useEffect(() => {(async () => setMessages(await getInbox(auth, true)))()}, []);

    const event = {
        title: "test",
        time: new Date(),
        color: "var(--bs-primary)",
        allDay: false,
    };

    function handleMessageSelected(message: MessagePreview) {
        if (!("sender" in message)) {
            throw new Error("Sent messages should not appear on the homepage");
        }
        setSelectedMessage(message);
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
                    selectedMessageId={selectedMessage && selectedMessage.id}
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
                shown={selectedMessage !== null}
                onDismiss={() => setSelectedMessage(null)}
            >
                {selectedMessage !== null && <MessageDisplay messagePreview={selectedMessage} />}
            </Popup>
        </>
    );
}