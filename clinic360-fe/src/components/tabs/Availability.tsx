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
    saveBlocked(); // Send data to backend when availability grid changes, if load on the server ever becomes a problem we'll want to make a dedicated save button to do this instead.
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

  // saving the "blocked" object to backend
  const saveBlocked = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/schedule", {
        method: "POST", // Use PUT if updating an existing entry
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blocked }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save blocked schedule");
      }
  
      console.log("Blocked schedule saved successfully");
    } catch (error) {
      console.error("Error saving blocked schedule:", error);
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
