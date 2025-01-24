import { Event } from "./Calendar";
import Rectangle from "../Rectangle";
import { useState } from "react";
import { WEEKDAYS } from "./names"

interface Props {
    year: number
    month: number
    events: Event[]
    onDaySelected?: ((day: Date) => void) | undefined
}

function getDaysForMonth(month: Date) {
    const startingWeekday = month.getDay();
    const startingDay = 1 - startingWeekday;
    return [...Array(42).keys()].map(i => 
        new Date(month.getFullYear(), month.getMonth(), startingDay + i)
    );
}

export default function CalendarMonth({year, month, events, onDaySelected}: Props) {    
    const monthDate = new Date(year, month, 1);
    const days = getDaysForMonth(monthDate);
    const [selectedDayIndex, setSelectedDayIndex] = useState(-1);

    function renderEventsForDay(day: Date) {
        const eventsForDay = events.filter(event => (
            event.time.getFullYear() === day.getFullYear() &&
            event.time.getMonth() === day.getMonth() &&
            event.time.getDate() === day.getDate()
        ));
        eventsForDay
            .sort((a, b) => a.title.localeCompare(b.title))
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .sort((a, b) => Number(b.allDay) - Number(a.allDay));
        return eventsForDay.map((event) => (
            <small className="d-block px-2 rounded-pill text-body" style={{backgroundColor: event.color}}>
                <b>{event.time.toLocaleTimeString(undefined, {hour: "numeric", minute: "numeric"})}</b> {event.title}
            </small>
        ))
    }

    function handleDaySelected(dayIndex: number) {
        if (onDaySelected) {
            setSelectedDayIndex(dayIndex);
            onDaySelected(days[dayIndex]);
        }
    }

    function renderDay(dayIndex: number) {
        const day = days[dayIndex];
        return (
            <div 
                className={`col p-1 border-end border-bottom ${dayIndex === selectedDayIndex ? "text-bg-primary" : ""}`}
                onClick={() => handleDaySelected(dayIndex)}
            >
                <div
                    className={`w-100 text-end ${day.getMonth() === month ? "" : "text-muted"}`}
                >
                    {day.getDate()}
                </div>
                {renderEventsForDay(days[dayIndex])}
            </div>
        );
    }

    // TODO: make cells scrollable
    return (
        <Rectangle className="d-flex flex-column" aspectRatio={1.2}>
            <div className="row g-0 border fw-bold text-center">
                {WEEKDAYS.map(day => {
                    return (
                        <div
                            className={`col p-1 ${day === WEEKDAYS[WEEKDAYS.length - 1] ? "" : "border-end"}`}
                            style={{width: `${100 / 7}%`}}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
            <div className="row g-0 flex-grow-1 border-start">
                {[...Array(6).keys()].map(week => (
                    <div className="row g-0" style={{height: `${100/6}%`}}>
                        {[...Array(7).keys()].map(weekday => renderDay(week * 7 + weekday))}
                    </div>
                ))}
            </div>
        </Rectangle>
    );
}