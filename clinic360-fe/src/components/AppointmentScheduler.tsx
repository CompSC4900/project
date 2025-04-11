import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../components/AuthContext";
import { getAppointmentDays, scheduleAppointment, getProviders, getAppointmentSettings } from "../util/Appointment";

const AppointmentScheduler: React.FC = () => {
    const auth = useAuth();
    
    const [step, setStep] = useState<number>(0); // Tracks which step the user is on
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [providers, setProviders] = useState<any[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
    const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
    const [selectedAppointmentType, setSelectedAppointmentType] = useState<number | null>(null);

    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    
    type AppointmentDayOption = {
        id: number;
        date: string;
    };
    const [availableDays, setAvailableDays] = useState<AppointmentDayOption[]>([]);
    
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        if (selectedProvider) fetchAppointmentTypes();
    }, [selectedProvider]);

    useEffect(() => {
        if (selectedMonth !== null) fetchAvailableDays();
    }, [selectedMonth]);

    useEffect(() => {
        if (selectedDay !== null) fetchAvailableTimeSlots();
    }, [selectedDay]);

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const response = await getProviders(auth);
            setProviders(response);
            setError(null);
        } catch (error) {
            console.error("Error fetching providers:", error);
            setError("Failed to fetch providers.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointmentTypes = async () => {
        try {
            setLoading(true);
            const settings = await getAppointmentSettings(auth, selectedProvider!);
            setAppointmentTypes(settings.appointment_types);
            setError(null);
        } catch (error) {
            console.error("Error fetching appointment types:", error);
            setError("Failed to fetch appointment types.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableDays = async () => {
        try {
            setLoading(true);
            const data = await getAppointmentDays(auth, parseInt(selectedMonth!, 10), new Date().getFullYear());
    
            //Ensure data is an array before calling map()
            if (!Array.isArray(data)) {
                console.error("Error: Expected an array but received:", data);
                setError("Unexpected response format.");
                return;
            }
    
            const daysWithAvailability = data.filter(
                day =>
                    day.doctor === selectedProvider &&
                    Array.isArray(day.available_slots) &&
                    day.available_slots.length > 0
            );
            setAvailableDays(
                daysWithAvailability.map(day => ({ id: day.id, date: day.date }))
            );
            
    
            setError(null);
        } catch (error) {
            console.error("Error fetching available days:", error);
            setError("Failed to fetch available days.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableTimeSlots = async () => {
        try {
            setLoading(true);
            const data = await getAppointmentDays(auth, parseInt(selectedMonth!, 10), new Date().getFullYear());
            const dayData = data.find(day => day.id === selectedDay);
            
            // Convert Date objects to ISO string format
            setAvailableTimeSlots(dayData ? dayData.available_slots.map(slot => slot.toISOString()) : []);
            
            setError(null);
        } catch (error) {
            console.error("Error fetching available time slots:", error);
            setError("Failed to fetch available time slots.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleScheduleAppointment = async () => {
        try {
            setLoading(true);
    
            if (!selectedTimeSlot) {
                throw new Error("Please select a valid time slot.");
            }
            
            console.log("Selected time slot (ISO):", selectedTimeSlot);
            console.log("Formatted UTC time (HH:mm):", getUtcTime(selectedTimeSlot));
            
            //Used in the confirmation message
            const formattedLocalTime = new Date(selectedTimeSlot).toLocaleString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

            await scheduleAppointment(auth, {
                day: selectedDay!,
                time: getUtcTime(selectedTimeSlot),
                appointment_type: selectedAppointmentType!,
                doctor: selectedProvider!,
                local_time_display: formattedLocalTime
              });              
    
            alert("Appointment successfully scheduled!");
            resetForm();
        } catch (error) {
            console.error("Error scheduling appointment:", error);
            setError("Failed to schedule appointment.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setStep(0);
        setSelectedProvider(null);
        setSelectedAppointmentType(null);
        setSelectedMonth(null);
        setAvailableDays([]);
        setSelectedDay(null);
        setAvailableTimeSlots([]);
        setSelectedTimeSlot(null);
        setError(null);
    };

    //Function converts local time selected by user back to UTC before scheduling appointment
    const getUtcTime = (isoString: string): string => {
        const localDate = new Date(isoString);  // This is in local timezone
        const utcHours = localDate.getUTCHours().toString().padStart(2, '0');
        const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, '0');
        return `${utcHours}:${utcMinutes}:00`;
    };
    
    function formatLocalDate(dateString: string): string {
        const [year, month, day] = dateString.split("-").map(Number);
        const localDate = new Date(year, month - 1, day); // JS months are 0-based
        return localDate.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      
    return (
        <>
            {/* Floating "Schedule an Appointment" Button */}
            <Button
                variant="primary"
                style={{ position: "fixed", bottom: "20px", right: "20px", borderRadius: "50%", width: "60px", height: "60px", fontSize: "24px" }}
                onClick={() => setStep(1)}
            >
                +
            </Button>

            {/* Multi-Step Scheduling Modal */}
            <Modal show={step > 0} onHide={resetForm}>
                <Modal.Header closeButton>
                    <Modal.Title>Schedule an Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading && <Spinner animation="border" />}
                    {error && <Alert variant="danger">{error}</Alert>}

                    {step === 1 && (
                        <>
                            <Form.Label>Select a Provider</Form.Label>
                            <Form.Control as="select" onChange={e => setSelectedProvider(parseInt(e.target.value))}>
                                <option value="">-- Select --</option>
                                {providers.map(provider => (
                                    <option key={provider.id} value={provider.id}>
                                        {provider.first_name} {provider.last_name}
                                    </option>
                                ))}
                            </Form.Control>
                            <Button className="mt-3" onClick={() => setStep(2)} disabled={!selectedProvider}>Next</Button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Form.Label>Select an Appointment Type</Form.Label>
                            <Form.Control as="select" onChange={e => setSelectedAppointmentType(parseInt(e.target.value))}>
                                <option value="">-- Select --</option>
                                {appointmentTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </Form.Control>
                            <Button className="mt-3" onClick={() => setStep(3)} disabled={!selectedAppointmentType}>Next</Button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <Form.Label>Select a Month</Form.Label>
                            <Form.Control as="select" onChange={e => setSelectedMonth(e.target.value)}>
                                <option value="">-- Select --</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
                                ))}
                            </Form.Control>
                            <Button className="mt-3" onClick={() => setStep(4)} disabled={selectedMonth === null}>Next</Button>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <Form.Label>Select a Day</Form.Label>
                            <Form.Control as="select" onChange={e => setSelectedDay(parseInt(e.target.value))}>
                                <option value="">-- Select --</option>
                                {availableDays.map(day => (
                                <option key={day.id} value={day.id}>
                                    {formatLocalDate(day.date)}
                                </option>
                            ))}

                            </Form.Control>
                            <Button className="mt-3" onClick={() => setStep(5)} disabled={selectedDay === null}>Next</Button>
                        </>
                    )}

                    {step === 5 && (
                        <>
                            <Form.Label>Select a Time Slot</Form.Label>
                            <Form.Control as="select" onChange={e => setSelectedTimeSlot(e.target.value)}>
                                <option value="">-- Select --</option>
                                {availableTimeSlots.map(slot => (
                                    <option key={slot} value={slot}>
                                        {new Date(slot).toLocaleTimeString()}
                                    </option>
                                ))}
                            </Form.Control>
                            <Button className="mt-3" onClick={handleScheduleAppointment} disabled={!selectedTimeSlot}>
                                Confirm Appointment
                            </Button>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AppointmentScheduler;