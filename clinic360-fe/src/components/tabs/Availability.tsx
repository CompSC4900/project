import Calendar from "../calendar/Calendar";
import DayView from "../calendar/DayView";
import { useState, useEffect } from "react";
import Popup from "../Popup";

export default function Scheduling() {
  const times = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM"
  ];

  // Get current Monday and week key
  const today = new Date();
  const shiftToMonday = (today.getDay() + 6) % 7;
  const initialMonday = new Date(today);
  initialMonday.setDate(initialMonday.getDate() - shiftToMonday);
  const initialWeekKey = initialMonday.toISOString().split("T")[0];

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  const getWeekKey = (monday) => monday.toISOString().split("T")[0];

  // Initialize blocked state with the current week grid pre-filled
  const [blocked, setBlocked] = useState(() => {
    const saved = localStorage.getItem("blockedWeeks");
    let weeks = saved ? JSON.parse(saved) : {};
    if (!weeks[initialWeekKey]) {
      weeks[initialWeekKey] = Array.from({ length: 5 }, () =>
        Array(times.length).fill(false)
      );
    }
    return weeks;
  });

  const [currentMonday, setCurrentMonday] = useState(initialMonday);
  const currentWeekKey = getWeekKey(currentMonday);

  // Ensure grid exists for the current week when week changes
  useEffect(() => {
    setBlocked(prev => {
      if (!prev[currentWeekKey]) {
        return {
          ...prev,
          [currentWeekKey]: Array.from({ length: 5 }, () =>
            Array(times.length).fill(false)
          ),
        };
      }
      return prev;
    });
  }, [currentWeekKey, times.length]);

  useEffect(() => {
    localStorage.setItem("blockedWeeks", JSON.stringify(blocked));
  }, [blocked]);

  const toggleBlock = (dayIndex, timeIndex) => {
    setBlocked(prev => {
      const grid = prev[currentWeekKey] ?? Array.from({ length: 5 }, () =>
        Array(times.length).fill(false)
      );
      const weekGrid = grid.map((row, dIndex) =>
        dIndex === dayIndex
          ? row.map((cell, tIndex) => (tIndex === timeIndex ? !cell : cell))
          : row
      );
      return { ...prev, [currentWeekKey]: weekGrid };
    });
  };

  // Get the days (Mon-Fri) for the current week
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    return d;
  });

  // Selected day for scheduling
  const [selectedDay, setSelectedDay] = useState(null);

  let availableTimes = [];
  if (selectedDay) {
    const dayIndex = weekDays.findIndex(
      (d) => d.toDateString() === selectedDay.toDateString()
    );
    if (dayIndex !== -1) {
      availableTimes = times
        .map((timeStr) => {
          let [time, modifier] = timeStr.split(" ");
          let [hours, minutes] = time.split(":").map(Number);
          if (modifier === "PM" && hours !== 12) hours += 12;
          if (modifier === "AM" && hours === 12) hours = 0;
          const dateWithTime = new Date(selectedDay);
          dateWithTime.setHours(hours, minutes, 0, 0);
          return dateWithTime;
        })
        .filter((_, tIndex) => !blocked[currentWeekKey]?.[dayIndex]?.[tIndex]);
    }
  }

  const [appointmentTime, setAppointmentTime] = useState(null);
  const event = { title: "test", time: new Date(), color: "#fc7e80", allDay: false };
  const events = [event];

  const handleAppointmentScheduled = (time) => setAppointmentTime(time);

  const prevWeek = () => {
    const prevMonday = new Date(currentMonday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    setCurrentMonday(prevMonday);
    setSelectedDay(null);
  };
  const nextWeek = () => {
    const nextMonday = new Date(currentMonday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    setCurrentMonday(nextMonday);
    setSelectedDay(null);
  };

  const weekRange = `${formatDate(weekDays[0])} - ${formatDate(weekDays[4])}`;

  type AvailabilitySlot = { start: string; end: string };

  // IN PROGRESS: function to use "blocked" to populate the initialized object 'overrides' in a way that is compatible with the backend
  // still very buggy:
  // - detecting series' of open timeslots mostly works, but detecting ones that go to the end of the day doesn't work (just need to check the final case after the loop)
  // - saving the dates for each day with blocked slots is not accurate at all (probably need to do something relating to how 'monday', 'date', and 'dayKey' are handled)
  function makeOverrides1(blocked: Record<string, boolean[][]>, times: string[]): Record<string, AvailabilitySlot[]> {
    let monday = new Date(); // turn the monday of the week in 'blocked' into a date object

    const result: Record<string, AvailabilitySlot[]> = {};

    for (const [weekKey, week] of Object.entries(blocked)) { // iterate through each week in 'blocked'
      monday = new Date(weekKey); // turn the monday of the week in 'blocked' into a date object

      for (let i = 0; i < week.length; i++) { // iterate through each day of the current week by index
        if (hasBlocked(week[i])) { // if the current day has any blocked time slots
          const date = monday;
          date.setDate(monday.getDate() + i);
          const dayKey = date.toISOString().split("T")[0]; // get current day's date in format: YYYY-MM-DD

          const slots: AvailabilitySlot[] = [];
          let startTime: string | null = null;

          if (week[i][0] === false) { // if first time slot in the current day isn't blocked, then set startTime to the first value in 'times'
            startTime = times[0];
          }

          for (let j = 1; j < week[i].length; j++) { // iterate through each time slot of the current day by index
            if (week[i][j] === false && week[i][j-1] === true) { // if current time slot is unblocked and previous time slot was blocked, set this as the startTime
              startTime = times[j];
            }
            if (week[i][j] === true && week[i][j-1] === false && startTime != null) { // if current time slot is blocked and previous time slot was unblocked, append a new AvailabilitySlot to 'slots'
              slots.push({ start: startTime, end: times[j]})
            }

            if (slots.length > 0) {
              result[dayKey] = slots
            }
            
          }
        }
      }
    }

    return result
  }

  // helper function to determine if there are any blocked time slots for a given day
  function hasBlocked(day: boolean[]): boolean {
    let blockedCount = 0;
    for (const slot of day) {
      if (slot === true) {
        blockedCount += 1;
      }
    }

    if (blockedCount > 0) {
      return true;
    }
    return false;
  }

  // saving the "blocked" object to backend
  const saveOverrides = async () => {
    let overrides = makeOverrides1(blocked, times);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/schedule", {
        method: "POST", // Use PUT if updating an existing entry
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ overrides }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save blocked schedule");
      }
  
      console.log("Schedule saved successfully");
      alert("Schedule saved!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", padding: 20 }}>
      {/* Left Column: Bigger Calendar */}
      <div style={{ width: "50%", marginRight: 20 }}>
        <Calendar onDaySelected={setSelectedDay} events={events} />
      </div>

      {/* Right Column: Scheduling interface */}
      <div style={{ width: "50%" }}>
        {/* Week Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={prevWeek}>Previous Week</button>
          <div>{weekRange}</div>
          <button onClick={nextWeek}>Next Week</button>
        </div>

        {/* Availability Grid */}
        <div>
          <h3 style={{ textAlign: "center" }}>Set Your Availability</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 20,
            padding: "0 20px",
            boxSizing: "border-box",
          }}>
            {weekDays.map((dateObj, dayIndex) => {
              const dayBg = dayIndex % 2 === 0 ? "#f8f8f8" : "#e0e0e0";
              return (
                <div key={dayIndex} style={{
                  backgroundColor: dayBg,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  padding: 10,
                  textAlign: "center",
                }}>
                  <div
                    style={{ fontWeight: "bold", marginBottom: 10, cursor: "pointer" }}
                    onClick={() => setSelectedDay(dateObj)}
                  >
                    {dateObj.toLocaleString("en-US", { weekday: "short" })} ({formatDate(dateObj)})
                  </div>
                  {times.map((time, tIndex) => {
                    const isBlocked = blocked[currentWeekKey]?.[dayIndex]?.[tIndex] ?? false;
                    return (
                      <div key={tIndex}
                        onClick={() => toggleBlock(dayIndex, tIndex)}
                        style={{
                          backgroundColor: isBlocked ? "#ffcccc" : "#fff",
                          borderRadius: 4,
                          margin: "5px 0",
                          padding: 5,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                        }}>
                        <span>{time}</span>
                        {isBlocked && <span style={{ color: "red", fontWeight: "bold" }}>X</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <button onClick={saveOverrides} style={{ marginTop: 20, padding: 10, background: "#0D6EFD", color: "white", borderRadius: 10, border: 0 }}>
            Save Schedule
          </button>
        </div>

        {/* DayView for the selected day */}
        {selectedDay && (
          <div style={{ marginTop: 20 }}>
            <h4>Available Times for {selectedDay.toLocaleDateString("en-US")}</h4>
            <DayView
              day={selectedDay}
              events={events}
              availableTimes={availableTimes}
              onAppointmentScheduled={handleAppointmentScheduled}
            />
          </div>
        )}

        <Popup shown={appointmentTime !== null} onDismiss={() => setAppointmentTime(null)}>
          <div className="p-3">Scheduling Appointment</div>
        </Popup>
      </div>
    </div>
  );
}
