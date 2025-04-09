//API and authorization components for appointment functions.
import { expectSuccess } from "./auth";
import { AuthFunctions } from "../components/AuthContext";

//Interface for the appointment preview that shows the date, number, doctor, patient, duration, and ID number.
export interface AppointmentPreview {
    id: number;
    name: string;
    time: Date;
    duration: number;
    doctor: string;
    patient: string;
}

//Extension of interface appointment showing the description, status, and appointment type.
export interface Appointment extends AppointmentPreview {
    description: string;
    status: string;
    appointment_type: string;
}

//Interface with boolean for the upcoming patient and duration number.
export interface AppointmentType {
    id: number;
    name: string;
    duration: number;
    patient_facing: boolean;
}

//Interface for the appointment day with available slots placed into a list along with the appointments.
export interface AppointmentDay {
    id: number;
    available_slots: Date[];
    appointments: AppointmentPreview[];
    doctor: number;
    date: string
}

export interface AppointmentSettings {
    id: number;
    appointment_types: AppointmentType[];
    appointment_slot_duration: number;
}

//Interface for the Appointment Creation information with the day, time, appointment type, and doctor number.
export interface AppointmentCreationInfo {
    day: number;
    time: string;
    appointment_type: number;
    doctor: number;
    local_time_display?: string;
}

//Interface for the provider's full name.
export interface Provider {
    id: number;
    first_name: string;
    last_name: string;
}

//Function to fetch the protected data about the appointment date.
export async function getAppointmentDays(auth: AuthFunctions, month: number, year: number): Promise<AppointmentDay[]> {
    const response = await auth.fetchProtectedData(`appointment/days/?month=${month}&year=${year}`, "GET");
    expectSuccess(response, auth);

    // Ensure response has 'data' and is an array
    if (!response.data || !Array.isArray(response.data)) {
        console.error("Invalid response received in getAppointmentDays:", response);
        return [];
    }

    return response.data.map((day: any) => ({
        ...day,
        available_slots: day.available_slots.map((slot: string) => new Date(slot)), // Convert slots to Date
    }));
}

export async function getAppointmentFromPreview(auth: AuthFunctions, preview: AppointmentPreview): Promise<Appointment> {
    const response = await auth.fetchProtectedData(`appointment/patient/details/${preview.id}/`, "GET");
    expectSuccess(response, auth);
    return {...preview, ...response.data};
}

export async function getAppointmentSettings(auth: AuthFunctions, doctorId: number): Promise<AppointmentSettings> {
    const response = await auth.fetchProtectedData(`appointment/patient/settings/?doctor=${doctorId}`, "GET");
    expectSuccess(response, auth);
    if (response.data.length === 0) {
        throw new Error("No appointment settings found for this doctor.");
    }
    return response.data[0];
}

export async function scheduleAppointment(auth: AuthFunctions, appointment: AppointmentCreationInfo): Promise<void> {
    const response = await auth.fetchProtectedData("appointment/patient/appointment/", "POST", appointment);
    expectSuccess(response, auth);
}

//Function for rescheduling an appointment based on patient and appointment info.
export async function rescheduleAppointment(auth: AuthFunctions, oldAppointment: AppointmentPreview, newAppointment: AppointmentCreationInfo): Promise<void> {
    const response = await auth.fetchProtectedData(`appointment/patient/reschedule/`, "POST", {
        id: oldAppointment.id,
        ...newAppointment,
    });
    expectSuccess(response, auth);
}

//Function for canceling an appointment based on patient and appointment info.
export async function cancelAppointment(auth: AuthFunctions, appointment: AppointmentPreview): Promise<void> {
    const response = await auth.fetchProtectedData(`appointment/patient/cancel/${appointment.id}/`, "DELETE");
    expectSuccess(response, auth);
}

export async function getProviders(auth: AuthFunctions): Promise<Provider[]> {
    const response = await auth.fetchProtectedData("appointment/providers/", "GET");
    expectSuccess(response, auth);
    return response.data;
}
