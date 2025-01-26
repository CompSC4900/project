import TimeViewer from "../TimeViewer";
import { Event } from "./Calendar";
import { MONTHS, WEEKDAYS_LONG } from "../../util/names";

interface Props {
    day: Date
    events: Event[]
    availableTimes: Date[]
    onAppointmentScheduled(time: Date): void;
}

function sameDate(date1: Date, date2: Date) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export default function DayView({day, events, availableTimes, onAppointmentScheduled}: Props) {
    const dayString = `${WEEKDAYS_LONG[day.getDay()]}, ${MONTHS[day.getMonth()]} ${day.getDate()}, ${day.getFullYear()}`;

    function maybeRenderAppointments() {
        const appointments = events.filter(event => sameDate(event.time, day));
        if (appointments.length !== 0) {
            return (
                <>
                    <hr />
                    <h5>Your Appointments</h5>
                    <TimeViewer times={events.map(event => ({time: event.time, content: event.title}))} />
                </>
            );
        }
    }

    function renderAvailableTimes() {
        if (availableTimes.length === 0) {
            return "No Times Available This Day"
        } else {
            return (
                <TimeViewer
                    times={availableTimes.map(time => (
                        {
                            time,
                            content: (
                                <div 
                                    className="ms-auto btn btn-primary"
                                    onClick={() => onAppointmentScheduled(time)}
                                >
                                    Schedule
                                </div>
                            )
                        }
                    ))}
                />
            );
        }
    }

    return (
        <>
            <h4>{dayString}</h4>
            {maybeRenderAppointments()}
            <hr />
            <h5>Available Times</h5>
            {renderAvailableTimes()}
        </>
    );
}