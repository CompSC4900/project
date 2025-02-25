import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";

/**
 * AppointmentScheduler Component
 *
 * This component allows patients to:
 * - Click a floating "Schedule an Appointment" button.
 * - Open a filtering modal to search for appointments based on:
 * - Date Range, Time Range, Location, Appointment Type, Insurance, Provider Name.
 * - View a list of available appointments (using dummy data for now).
 * - Select an appointment and confirm before adding it to the calendar.
 */

const AppointmentScheduler: React.FC = () => {
    // State variables
    const [showFilterModal, setShowFilterModal] = useState<boolean>(false); // Controls the filtering modal
    const [showResultsModal, setShowResultsModal] = useState<boolean>(false); // Controls the results modal
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // Controls the confirmation modal
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null); // Stores the selected appointment
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState({
        dateStart: "",
        dateEnd: "",
        timeStart: "",
        timeEnd: "",
        type: "",
        provider: "",
    });

    const resetFilters = () => {
        setFilters({
            dateStart: "",
            dateEnd: "",
            timeStart: "",
            timeEnd: "",
            type: "",
            provider: "",
        });
    };

    /**
     * Handles user input in the filtering form.
     * @param {React.ChangeEvent<any>} e - Input event
     */
    const handleFilterChange = (e: React.ChangeEvent<any>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    //Fetches appointments from the backend
    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();

            if (filters.dateStart) queryParams.append("dateStart", filters.dateStart);
            if (filters.dateEnd) queryParams.append("dateEnd", filters.dateEnd);
            if (filters.timeStart) queryParams.append("timeStart", filters.timeStart);
            if (filters.timeEnd) queryParams.append("timeEnd", filters.timeEnd);
            if (filters.type) queryParams.append("type", filters.type);
            if (filters.provider) queryParams.append("provider", filters.provider);

            const response = await fetch(`/api/appointment/days/?${queryParams.toString()}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`, // Assuming authentication token is stored
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch appointment availability.");
            }

            const data = await response.json();
            setAppointments(data);
        } catch (err) {
            setError("Error retrieving available appointments. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles the search function when the "Search" button is clicked.
     */
    const handleSearch = async () => {
        setShowFilterModal(false); // Close the filter modal
        setShowResultsModal(true); // Show results modal
        await fetchAppointments();
    };

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
                                <option value="General Checkup">General Checkup</option>
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
                    {loading ? (
                        <Spinner animation="border" />
                    ) : error ? (
                        <Alert variant="danger">{error}</Alert>
                    ) : appointments.length > 0 ? (
                        appointments.map((appt) => (
                            <div key={appt.id} className="border p-2 mb-2">
                                <strong>{appt.type}</strong> with <strong>{appt.provider}</strong>
                                <br />
                                <span>{appt.date} at {appt.time}</span>
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
