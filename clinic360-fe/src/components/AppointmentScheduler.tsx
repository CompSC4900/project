import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

/**
 * AppointmentScheduler Component
 *
 * This component allows patients to:
 * - Click a floating "Schedule an Appointment" button.
 * - Open a filtering modal to search for appointments based on:
 * - Date Range, Time Range, Location, Appointment Type, Insurance, Provider Name.
 * - View a list of available appointments (using dummy data for now).
 * - Select an appointment and confirm before adding it to the calendar.
 *
 * Notes:
 * - Currently uses static data but will later connect to provider availability.
 */

const AppointmentScheduler: React.FC = () => {
    // State variables
    const [showFilterModal, setShowFilterModal] = useState<boolean>(false); // Controls the filtering modal
    const [showResultsModal, setShowResultsModal] = useState<boolean>(false); // Controls the results modal
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // Controls the confirmation modal
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null); // Stores the selected appointment
    const [filters, setFilters] = useState({
        dateStart: "",
        dateEnd: "",
        timeStart: "",
        timeEnd: "",
        location: "",
        type: "",
        insurance: "",
        provider: "",
    });

    const resetFilters = () => {
        setFilters({
            dateStart: "",
            dateEnd: "",
            timeStart: "",
            timeEnd: "",
            location: "",
            type: "",
            insurance: "",
            provider: "",
        });
    };
    
    /**
     * Dummy Data: Example appointment slots.
     * - This will later be replaced with actual provider availability.
     */
    const dummyAppointments = [
        { 
            id: 1, 
            provider: "Dr. Smith", 
            location: "Knoxville Dental", 
            type: "Dental Checkup", 
            date: "2025-02-15", 
            time: "3:00 PM", 
            duration: "30 min", 
            insurance: "BlueCross BlueShield"
        },
        { 
            id: 2, 
            provider: "Dr. Johnson", 
            location: "East TN Healthcare", 
            type: "General Consultation", 
            date: "2025-03-10", 
            time: "9:30 AM", 
            duration: "45 min", 
            insurance: "UnitedHealthcare"
        },
        { 
            id: 3, 
            provider: "Dr. Patel", 
            location: "Knoxville Clinic", 
            type: "Eye Exam", 
            date: "2025-04-05", 
            time: "1:00 PM", 
            duration: "20 min", 
            insurance: "Aetna"
        }
    ];
    

    /**
     * Handles user input in the filtering form.
     * @param {React.ChangeEvent<any>} e - Input event
     */
    const handleFilterChange = (e: React.ChangeEvent<any>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    /**
     * Handles the search function when the "Search" button is clicked.
     * In the future, this will fetch real data from the database.
     */
    const handleSearch = () => {
        setShowFilterModal(false); // Close the filter modal
        setShowResultsModal(true); // Show results modal
    };

    /**
     * Converts time stored as a string into 24-hour format. Used by filteredAppointments
     * to compare filter user sets to value stored in dummy data. May not need this when
     * we convert to an actual database and do not store time as strings
     * 
     */
    function convertTo24HourFormat(timeStr: string): string {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
    
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
    
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
    
    /**
     * Filters appointments based on user input.
     */
    const filteredAppointments = (() => {
        // Step 1: If all filters are empty, return all appointments immediately
        if (!filters.dateStart && !filters.dateEnd && !filters.timeStart && !filters.timeEnd &&
            !filters.location && !filters.insurance && !filters.provider && !filters.type) {
            return dummyAppointments;
        }
    
        return dummyAppointments.filter((appt) => {
            // Convert appointment time string into a comparable Date object
            const apptTime = new Date(`1970-01-01T${convertTo24HourFormat(appt.time)}`);
    
            // Convert filter times to Date objects (if provided)
            const filterTimeStart = filters.timeStart ? new Date(`1970-01-01T${filters.timeStart}`) : null;
            const filterTimeEnd = filters.timeEnd ? new Date(`1970-01-01T${filters.timeEnd}`) : null;
    
            // Date Range Filter
            const matchesDate =
                (!filters.dateStart || new Date(appt.date) >= new Date(filters.dateStart)) &&
                (!filters.dateEnd || new Date(appt.date) <= new Date(filters.dateEnd));
    
            // Time Range Filter (properly compares time as Date object)
            const matchesTime =
                (!filterTimeStart || apptTime >= filterTimeStart) &&
                (!filterTimeEnd || apptTime <= filterTimeEnd);
    
            // Location Filter
            const matchesLocation = !filters.location || appt.location.toLowerCase().includes(filters.location.toLowerCase());
    
            // Insurance Filter
            const matchesInsurance = !filters.insurance || appt.insurance.toLowerCase().includes(filters.insurance.toLowerCase());
    
            // Provider Filter
            const matchesProvider = !filters.provider || appt.provider.toLowerCase().includes(filters.provider.toLowerCase());
    
            // Appointment Type Filter
            const matchesType = !filters.type || appt.type === filters.type;
    
            return matchesDate && matchesTime && matchesLocation && matchesInsurance && matchesProvider && matchesType;
        });
    })();
    


    /**
     * Handles selecting an appointment.
     */
    const handleSelectAppointment = (appointment: any) => {
        setSelectedAppointment(appointment);
        setShowResultsModal(false);
        setShowConfirmModal(true);
    };

    return (
        <>
            {/* Floating "Schedule an Appointment" Button */}
            <Button
                variant="primary"
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    fontSize: "24px",
                }}
                onClick={() => {
                    resetFilters();
                    setShowFilterModal(true);
                }}
            >
                +
            </Button>

             {/* Filtering Modal */}
             <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Schedule an Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Date Range */}
                        <Form.Group>
                            <Form.Label>Date Range</Form.Label>
                            <div className="d-flex">
                                <Form.Control type="date" name="dateStart" onChange={handleFilterChange} />
                                <span className="mx-2">to</span>
                                <Form.Control type="date" name="dateEnd" onChange={handleFilterChange} />
                            </div>
                        </Form.Group>

                        {/* Time Range */}
                        <Form.Group className="mt-2">
                            <Form.Label>Time Range</Form.Label>
                            <div className="d-flex">
                                <Form.Control type="time" name="timeStart" onChange={handleFilterChange} />
                                <span className="mx-2">to</span>
                                <Form.Control type="time" name="timeEnd" onChange={handleFilterChange} />
                            </div>
                        </Form.Group>

                        {/* Location */}
                        <Form.Group className="mt-2">
                            <Form.Label>Location</Form.Label>
                            <Form.Control type="text" name="location" onChange={handleFilterChange} />
                        </Form.Group>

                        {/* Insurance */}
                        <Form.Group className="mt-2">
                            <Form.Label>Insurance Accepted</Form.Label>
                            <Form.Control type="text" name="insurance" onChange={handleFilterChange} />
                        </Form.Group>

                        {/* Provider */}
                        <Form.Group className="mt-2">
                            <Form.Label>Provider Name</Form.Label>
                            <Form.Control type="text" name="provider" onChange={handleFilterChange} />
                        </Form.Group>

                        {/* Appointment Type */}
                        <Form.Group className="mt-2">
                            <Form.Label>Appointment Type</Form.Label>
                            <Form.Control as="select" name="type" onChange={handleFilterChange}>
                                <option value="">Select</option>
                                <option value="Dental Checkup">Dental Checkup</option>
                                <option value="General Consultation">General Consultation</option>
                                <option value="Eye Exam">Eye Exam</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFilterModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleSearch}>Search</Button>
                </Modal.Footer>
            </Modal>

            {/* Results Modal */}
            <Modal show={showResultsModal} onHide={() => setShowResultsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Available Appointments</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appt) => (
                            <div key={appt.id} className="border p-2 mb-2">
                                <strong>{appt.type}</strong> with <strong>{appt.provider}</strong> at <strong>{appt.location}</strong>
                                <br />
                                <span>{appt.date} at {appt.time} ({appt.duration})</span>
                                <Button className="mt-2" variant="success" size="sm" onClick={() => handleSelectAppointment(appt)}>
                                    Select
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p>No available appointments match your filters.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                            resetFilters();
                            setShowResultsModal(false);
                            setShowFilterModal(true);
                        }}>Back to Filters
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <>
                            <p><strong>Provider:</strong> {selectedAppointment.provider}</p>
                            <p><strong>Location:</strong> {selectedAppointment.location}</p>
                            <p><strong>Type:</strong> {selectedAppointment.type}</p>
                            <p><strong>Date:</strong> {selectedAppointment.date}</p>
                            <p><strong>Time:</strong> {selectedAppointment.time}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AppointmentScheduler;
