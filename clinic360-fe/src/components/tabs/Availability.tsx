import Calendar from "../calendar/Calendar";
import DayView from "../calendar/DayView";
import { useState } from "react";
import Popup from "../Popup";

export default function Scheduling() {
  // Array of half hour blocks (minus 12 for lunch)
  const times = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:30 PM",
    "1:00 PM",  "1:30 PM",  "2:00 PM",  "2:30 PM",
    "3:00 PM",  "3:30 PM",  "4:00 PM",  "4:30 PM",
    "5:00 PM"
  ];

  //availability grid for two weeks (current Mon-Fri and next Mon-Fri)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun..6=Sat
  const shiftToMonday = (dayOfWeek + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(thisMonday.getDate() - shiftToMonday);

  // Current week (Mon-Fri)
  const availabilityDays = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(thisMonday);
    d.setDate(thisMonday.getDate() + i);
    availabilityDays.push(d);
  }
  // Next week (Mon-Fri)
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  for (let i = 0; i < 5; i++) {
    const d = new Date(nextMonday);
    d.setDate(nextMonday.getDate() + i);
    availabilityDays.push(d);
  }

  // Format current date as MM/DD
  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit"
    });
  }

  // Availability state grid
  // false means the time is available (unblocked)
  const initialBlocked = Array.from({ length: 10 }, () =>
    Array(times.length).fill(false)
  );
  const [blocked, setBlocked] = useState(initialBlocked);

  function toggleBlock(dayIndex, timeIndex) {
    const copy = [...blocked];
    copy[dayIndex] = [...copy[dayIndex]];
    copy[dayIndex][timeIndex] = !copy[dayIndex][timeIndex];
    setBlocked(copy);
  }

  //  When a day is selected in the Calendar, we want to use the unblocked times
  let availableTimes = [];
  // selectedDay comes from the Calendar below.
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  if (selectedDay) {
    // Find the index of the selected day in the availabilityDays array by comparing date strings.
    const index = availabilityDays.findIndex(
      day => day.toDateString() === selectedDay.toDateString()
    );
    if (index !== -1) {
      availableTimes = times
        .map((timeStr, tIndex) => {
          // Parse time DONT TOUCH
          let [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":").map(Number);
          if (modifier === "PM" && hours !== 12) hours += 12;
          if (modifier === "AM" && hours === 12) hours = 0;
          const dateWithTime = new Date(selectedDay);
          dateWithTime.setHours(hours, minutes, 0, 0);
          return dateWithTime;
        })
        // Only include unblocked (available) times.
        .filter((_, tIndex) => !blocked[index][tIndex]);
    }
  }

  // 5. Other scheduling state
  const [appointmentTime, setAppointmentTime] = useState<Date | null>(null);
  const event = {
    title: "test",
    time: new Date(),
    color: "#fc7e80",
    allDay: false,
  };
  const events = [event];

  function handleAppointmentScheduled(time: Date) {
    setAppointmentTime(time);
  }

  return (
    <>
      <div className="card w-50 p-3 me-5">
        <Calendar events={events} onDaySelected={setSelectedDay} />
      </div>
      <div className="card w-50 p-3">
        {selectedDay === null ? (
          <h4>No day selected</h4>
        ) : (
          <DayView
            day={selectedDay}
            events={events}
            availableTimes={availableTimes}
            onAppointmentScheduled={handleAppointmentScheduled}
          />
        )}
      </div>
      <Popup
        shown={appointmentTime !== null}
        onDismiss={() => setAppointmentTime(null)}
      >
        <div className="p-3">Scheduling Appointment</div>
      </Popup>

      {/* Optional: Show the availability grid for setting your availability */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ textAlign: "center" }}>Set Your Availability</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 20,
            width: "100%",
            boxSizing: "border-box",
            padding: "0 20px",
          }}
        >
          {availabilityDays.map((dateObj, dayIndex) => {
            const dayBackground = dayIndex % 2 === 0 ? "#f8f8f8" : "#e0e0e0";
            return (
              <div
                key={dayIndex}
                style={{
                  backgroundColor: dayBackground,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: 10,
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: 10 }}>
                  {dateObj.toLocaleString("en-US", { weekday: "short" })} ({formatDate(dateObj)})
                </div>
                {times.map((time, tIndex) => {
                  const isBlocked = blocked[dayIndex][tIndex];
                  return (
                    <div
                      key={tIndex}
                      onClick={() => toggleBlock(dayIndex, tIndex)}
                      style={{
                        backgroundColor: isBlocked ? "#ffcccc" : "#fff",
                        borderRadius: 4,
                        margin: "5px 0",
                        padding: 5,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{time}</span>
                      {isBlocked && (
                        <span style={{ color: "red", fontWeight: "bold" }}>X</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
