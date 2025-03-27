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

  // new constant for keeping track of times in a format ideal for processing
  const times24 = [
    "9:00", "9:30", "10:00", "10:30", 
    "11:00", "11:30", "12:30", "13:00", 
    "13:30", "14:00", "14:30", "15:00", 
    "15:30", "16:00", "16:30", "17:00"
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

  // custom object to store start and end times for day overrides
  type AvailabilitySlot = { start: string; end: string };

  // makes a dictionary of availability slots to store the daily overrides set by the staff user in the Availability tab
  function getOverrides(blocked: Record<string, boolean[][]>, times: string[]): Record<string, AvailabilitySlot[]> {
    const result: Record<string, AvailabilitySlot[]> = {};

    for (const date in blocked) {
      const weekData = blocked[date]; // Get the week's data (5 days)

      // Get each day's corresponding date
      const weekStart = new Date(date);
      for (let i = 0; i < weekData.length; i++) {
        // getting current date
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const formattedDate = currentDate.toISOString().split("T")[0];

        // Check if not all values are false for the given day
        if (!(weekData[i].every((value) => value === false))) {

          const slots: AvailabilitySlot[] = [];
          let startTime: string | null = null;

          if (weekData[i][0] === false) { // if first time slot in the current day isn't blocked, then set startTime to the first value in 'times'
            startTime = times[0];
          }

          for (let j = 0; j < weekData[i].length; j++) {
            if (weekData[i][j] === false && weekData[i][j-1] === true) { // if current time slot is unblocked and previous time slot was blocked, set this as the startTime
              startTime = times[j];
            }
            if (weekData[i][j] === true && weekData[i][j-1] === false && startTime != null) { // if current time slot is blocked and previous time slot was unblocked, append a new AvailabilitySlot to 'slots'
              slots.push({ start: startTime, end: times[j]})
            }

          }

          if (weekData[i][weekData[i].length-1] === false && startTime != null) { // handle end case, where last time slot is not blocked
            slots.push({ start: startTime, end: "17:30"});
          }

          result[formattedDate] = slots;

        }
      }
    }

    return result;
  }

  // saving the "blocked" object to backend
  const saveOverrides = async () => {
    let overrides = getOverrides(blocked, times); // changing for testing
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

  // still need to figure out appointment_types issue
  // sending availability info to backend to be saved in AppointmentSettings model
  const createAppointmentSettingsModel = async () => {
    const data = {
      appointment_types: [1, 2], // hardcoded values for testing purposes ONLY, will need to change later
      appointment_slot_duration: 30,
      weekly_schedule: [
          [], 
          [{"start": "09:00", "end": "17:30"}], 
          [{"start": "09:00", "end": "17:30"}], 
          [{"start": "09:00", "end": "17:30"}], 
          [{"start": "09:00", "end": "17:30"}], 
          [{"start": "09:00", "end": "17:30"}], 
          []
      ],
      day_overrides: getOverrides(blocked, times24),
      reschedule_window: 48,
      schedulable_duration: 30,
      schedulable_cutoff_override: null,
      doctor: 3 // hardcoded value for testing purposes ONLY, will need to change later
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/api/appointment/settings/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("access_token"), // authorization for API request, useful reference for future API requests
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Success:", responseData);
    } catch (error) {
        console.error("Error:", error);
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
          <button onClick={createAppointmentSettingsModel} style={{ marginTop: 20, padding: 10, background: "#0D6EFD", color: "white", borderRadius: 10, border: 0 }}>
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
