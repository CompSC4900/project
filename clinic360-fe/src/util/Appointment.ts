import { expectSuccess } from "./auth";
import { AuthFunctions } from "../components/AuthContext";

export interface AppointmentPreview {
    id: number;
    name: string;
    time: Date;
    duration: number;
    doctor: string;
    patient: string;
}

export interface Appointment extends AppointmentPreview {
    description: string;
    status: string;
    appointment_type: string;
}

export interface AppointmentType {
    id: number;
    name: string;
    duration: number;
    patient_facing: boolean;
}

export interface AppointmentDay {
    id: number;
    available_slots: Date[];
    appointments: AppointmentPreview[];
}

export interface AppointmentSettings {
    id: number;
    appointment_types: AppointmentType[];
    appointment_slot_duration: number;
}

export interface AppointmentCreationInfo {
    dayId: number;
    time: Date;
    appointmentTypeId: number;
    doctorId: number;
}

export async function getAppointmentDays(auth: AuthFunctions, month: number, year: number): Promise<AppointmentDay[]> {
    const response = await auth.fetchProtectedData(`appointment/days/?month=${month}&year=${year}`, "GET");
    expectSuccess(response, auth);
    return {
        ...response.data,
        available_slots: response.data.available_slots.map((slot: string) => new Date(slot)),
    };
}

export async function getAppointmentFromPrieview(auth: AuthFunctions, preview: AppointmentPreview): Promise<Appointment> {
    const response = await auth.fetchProtectedData(`appointment/patient/details/${preview.id}/`, "GET");
    expectSuccess(response, auth);
    return {...preview, ...response.data};
}

export async function createAppointment(auth: AuthFunctions, appointment: Appointment): Promise<Appointment> {
    const response = await auth.fetchProtectedData("appointment/patient/appointment/", "POST", appointment);
    expectSuccess(response, auth);
    return response.data;
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

export async function rescheduleAppointment(auth: AuthFunctions, oldAppointment: AppointmentPreview, newAppointment: AppointmentCreationInfo): Promise<void> {
    const response = await auth.fetchProtectedData(`appointment/patient/reschedule/`, "POST", {
        id: oldAppointment.id,
        ...newAppointment,
    });
    expectSuccess(response, auth);
}

export async function cancelAppointment(auth: AuthFunctions, appointment: AppointmentPreview): Promise<void> {
    const response = await auth.fetchProtectedData(`appointment/patient/cancel/${appointment.id}/`, "DELETE");
    expectSuccess(response, auth);
}