import Calendar from "../calendar/Calendar";
import DayView from "../calendar/DayView";
import { useState, useEffect } from "react";
import { apiBase } from "../../util/auth";
import Popup from "../Popup";

// interface to store appointment type information
export interface AppointmentType {
  id: number;
  name: string;
  duration: number;
  patient_facing: boolean;
}

// function to get appointment type IDs from backend for availability-saving functionality to reference
async function fetchAppointmentTypes(): Promise<AppointmentType[]> {

  const response = await fetch(apiBase + "appointment/staff/type/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("access_token"),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch appointment types");
  }

  return await response.json();
}

export default function Scheduling() {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);

  useEffect(() => {
    fetchAppointmentTypes()
      .then(setAppointmentTypes)
      .catch((err) => console.error("Error loading appointment types:", err));
  }, []);

  const appointmentTypeIds = appointmentTypes.map(type => type.id);

  const times = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM"
  ];

  const times24 = [
    "9:00", "9:30", "10:00", "10:30",
    "11:00", "11:30", "12:30", "13:00",
    "13:30", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30", "17:00"
  ];

  const today = new Date();
  const shiftToMonday = (today.getDay() + 6) % 7;
  const initialMonday = new Date(today);
  initialMonday.setDate(initialMonday.getDate() - shiftToMonday);
  const initialWeekKey = initialMonday.toISOString().split("T")[0];

  const formatDate = (date) => date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" });
  const getWeekKey = (monday) => monday.toISOString().split("T")[0];

  const [blocked, setBlocked] = useState(() => {
    const saved = localStorage.getItem("blockedWeeks");
    let weeks = saved ? JSON.parse(saved) : {};
    if (!weeks[initialWeekKey]) {
      weeks[initialWeekKey] = Array.from({ length: 5 }, () => Array(times.length).fill(false));
    }
    return weeks;
  });

  const [currentMonday, setCurrentMonday] = useState(initialMonday);
  const currentWeekKey = getWeekKey(currentMonday);

  useEffect(() => {
    setBlocked(prev => {
      if (!prev[currentWeekKey]) {
        return { ...prev, [currentWeekKey]: Array.from({ length: 5 }, () => Array(times.length).fill(false)) };
      }
      return prev;
    });
  }, [currentWeekKey, times.length]);

  const toggleBlock = (dayIndex, timeIndex) => {
    setBlocked(prev => {
      const grid = prev[currentWeekKey] ?? Array.from({ length: 5 }, () => Array(times.length).fill(false));
      const weekGrid = grid.map((row, dIndex) =>
        dIndex === dayIndex
          ? row.map((cell, tIndex) => (tIndex === timeIndex ? !cell : cell))
          : row
      );
      return { ...prev, [currentWeekKey]: weekGrid };
    });
  };

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    return d;
  });

  const [selectedDay, setSelectedDay] = useState(null);

  let availableTimes = [];
  if (selectedDay) {
    const dayIndex = weekDays.findIndex((d) => d.toDateString() === selectedDay.toDateString());
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
  const event = { title: "Today", time: new Date(), color: "#0D6EFD", allDay: false };
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

  function getOverrides(blocked, times) {
    const result = {};
    for (const date in blocked) {
      const weekData = blocked[date];
      const weekStart = new Date(date);
      for (let i = 0; i < weekData.length; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const formattedDate = currentDate.toISOString().split("T")[0];

        if (!(weekData[i].every((v) => v === false))) {
          const slots = [];
          let startTime = null;
          if (weekData[i][0] === false) startTime = times[0];
          for (let j = 0; j < weekData[i].length; j++) {
            if (weekData[i][j] === false && weekData[i][j - 1] === true) startTime = times[j];
            if (weekData[i][j] === true && weekData[i][j - 1] === false && startTime != null) {
              slots.push({ start: startTime, end: times[j] });
            }
          }
          if (weekData[i][weekData[i].length - 1] === false && startTime != null) {
            slots.push({ start: startTime, end: "17:30" });
          }
          result[formattedDate] = slots;
        }
      }
    }
    return result;
  }

  const createAppointmentSettingsModel = async () => {
    // Save blocked weeks into localStorage before sending
    localStorage.setItem("blockedWeeks", JSON.stringify(blocked));
  
    const data = {
      appointment_types: appointmentTypeIds,
      appointment_slot_duration: 30,
      weekly_schedule: [[], [{ start: "09:00", end: "17:30" }], [{ start: "09:00", end: "17:30" }], [{ start: "09:00", end: "17:30" }], [{ start: "09:00", end: "17:30" }], [{ start: "09:00", end: "17:30" }], []],
      day_overrides: getOverrides(blocked, times24),
      reschedule_window: 48,
      schedulable_duration: 30,
      schedulable_cutoff_override: null,
      doctor: 1
    };
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/appointment/settings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const responseData = await response.json();
      console.log("Success:", responseData);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  

  return (
    <div style={{ display: "flex", padding: "40px 20px", gap: "40px", alignItems: "flex-start" }}>
      
      <div style={{ width: "50%", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <Calendar onDaySelected={setSelectedDay} events={events} />
      </div>

      <div style={{ width: "50%" }}>
        
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <button className="btn btn-outline-primary btn-sm" onClick={prevWeek}>‹</button>
          <div style={{ fontWeight: "bold" }}>{weekRange}</div>
          <button className="btn btn-outline-primary btn-sm" onClick={nextWeek}>›</button>
        </div>

        <h3 style={{ textAlign: "center" }}>Set Your Availability</h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "20px",
          padding: "20px 0",
        }}>
          {weekDays.map((dateObj, dayIndex) => (
            <div key={dayIndex} style={{
              backgroundColor: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontWeight: "bold", marginBottom: "10px", cursor: "pointer" }}
                onClick={() => setSelectedDay(dateObj)}>
                {dateObj.toLocaleString("en-US", { weekday: "short" })} ({formatDate(dateObj)})
              </div>
              {times.map((time, tIndex) => {
                const isBlocked = blocked[currentWeekKey]?.[dayIndex]?.[tIndex] ?? false;
                return (
                  <div key={tIndex} onClick={() => toggleBlock(dayIndex, tIndex)}
                    style={{
                      fontSize: "12px",
                      backgroundColor: isBlocked ? "#ffe5e5" : "#f8f8f8",
                      padding: "6px",
                      margin: "4px 0",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      transition: "0.2s",
                    }}>
                    <span>{time}</span>
                    {isBlocked && <span style={{ color: "red", fontWeight: "bold" }}>X</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <button 
          onClick={createAppointmentSettingsModel}
          style={{
            display: "block",
            margin: "30px auto 0 auto",
            padding: "12px 20px",
            background: "#0D6EFD",
            color: "white",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            cursor: "pointer"
          }}
        >
          Save Schedule
        </button>

        {selectedDay && (
          <div style={{ marginTop: "20px" }}>
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
