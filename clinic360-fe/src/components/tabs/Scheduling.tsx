import Calendar from "../calendar/Calendar";
import DayView from "../calendar/DayView";
import { useState } from "react";
import Popup from "../Popup";
import AppointmentScheduler from "../AppointmentScheduler";
//Import components to help create an appointment using calendar and time information.

//Main export for the schedule component.
export default function Scheduling() {
    let [selectedDay, setSelectedDay] = useState<Date | null>(null);
    let [appointmentTime, setAppointmentTime] = useState<Date | null>(null);

    //Details for a test event with a specified date and color.
    const event = {
        title: "Today",
        time: new Date(),
        color: "#0D6EFD",
        allDay: false,
    };
    const events = [event];

    //Function for the appointment time.
    function handleAppointmentScheduled(time: Date) {
        setAppointmentTime(time);
    }
    
    return (
        <>
            <div className="card w-50 p-3 me-5">
                <Calendar
                    events={events}
                    onDaySelected={setSelectedDay}
                />
            </div>
            
            <div className="card w-50 p-3">
                {
                    selectedDay === null ?
                        <h4>No Day Selected . . .</h4>
                    :
                        <DayView
                            day={selectedDay} 
                            events={events} 
                            availableTimes={[new Date(2025, 0, 1, 10, 0), new Date(2025, 0, 1, 10, 30)]}
                            onAppointmentScheduled={handleAppointmentScheduled}
                        />
                }
                
            </div>
            <Popup
                shown={appointmentTime !== null}
                onDismiss={() => setAppointmentTime(null)}
            >
                <div className="p-3">Scheduling Appointment</div>
            </Popup>

            {/* Floating Button for Scheduling Appointments */}
            <AppointmentScheduler />  
        </>
    );
}
