import { useState } from "react";
import CalendarMonth from "./CalendarMonth";
import { MONTHS } from "./names";

export interface Event {
    time: Date
    allDay: boolean
    color: string
    title: string
}

interface Props {
    events: Event[]
    onDaySelected?: ((day: Date) => void) | undefined
}

export default function Calendar({events, onDaySelected}: Props) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());

    function monthChangeHandlerFactory(changeAmount: number) {
        return () => {
            const newMonth = month + changeAmount
            setYear(year + Math.floor(newMonth / 12));
            setMonth(((newMonth % 12) + 12) % 12); // modulo fix for negative numbers
        }
    }

    return (
        <>
            <div className="d-flex mb-3">
                <h4 className="align-self-center m-0">{`${MONTHS[month]} ${year}`}</h4>
                <div className="btn-group ms-auto">
                    <button
                        className="btn btn-primary bi-caret-left-fill"
                        onClick={monthChangeHandlerFactory(-1)}
                        aria-label="Previous month"
                    />
                    <button
                        className="btn btn-primary bi-caret-right-fill"
                        onClick={monthChangeHandlerFactory(1)}
                        aria-label="Next month"
                    />
                </div>
            </div>
            <CalendarMonth year={year} month={month} events={events} onDaySelected={onDaySelected} />
        </>
    );
}