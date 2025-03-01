import { AuthFunctions } from "../components/AuthContext";
import { Appointment, AppointmentPreview, AppointmentType } from "./Appointment";
import { expectSuccess } from "./auth";

interface StaffAppointmentSettings {
    id: number;
    appointment_types: number[];
    appointment_slot_duration: number;
    weekly_schedule: {
        start: string;
        end: string; 
    }[][];
    day_overrides: {
        [date: string]: {
            start: string;
            end: string;
        }[];
    };
    reschedule_window: number;
    schedulable_duration: number;
    schedulable_cutoff_override: string | null;
    doctor: number;
}

export interface StaffAppointment extends Appointment {
    internal_notes: string;
    added_by: string;
    added_by_role: 'patient' | 'staff';
}

export async function getAppointmentType(auth: AuthFunctions, id: number): Promise<AppointmentType> {
    const response = await auth.fetchProtectedData(`appointment/staff/type/${id}/`, "GET");
    expectSuccess(response, auth);
    return response.data;
}

export async function createAppointmentType(auth: AuthFunctions, appointmentType: AppointmentType): Promise<AppointmentType> {
    const response = await auth.fetchProtectedData(`appointment/staff/type/`, "POST", appointmentType);
    expectSuccess(response, auth);
    return response.data;
}

export async function getStaffAppointmentSettings(auth: AuthFunctions): Promise<StaffAppointmentSettings[]> {
    const response = await auth.fetchProtectedData(`appointment/settings/`, "GET");
    expectSuccess(response, auth);
    return response.data;
}

export async function createStaffAppointmentSettings(auth: AuthFunctions, settings: StaffAppointmentSettings): Promise<StaffAppointmentSettings> {
    const response = await auth.fetchProtectedData(`appointment/settings/`, "POST", settings);
    expectSuccess(response, auth);
    return response.data;
}

export async function getStaffAppointmentFromPreview(auth: AuthFunctions, preview: AppointmentPreview): Promise<StaffAppointment> {
    const response = await auth.fetchProtectedData(`appointment/staff/details/${preview.id}/`, "GET");
    expectSuccess(response, auth);
    return {...preview, ...response.data};
}

export async function createStaffAppointment(auth: AuthFunctions, appointment: StaffAppointment): Promise<StaffAppointment> {
    const response = await auth.fetchProtectedData(`appointment/staff/appointment/`, "POST", appointment);
    expectSuccess(response, auth);
    return response.data;
}

export async function updateStaffAppointment(auth: AuthFunctions, appointment: StaffAppointment): Promise<StaffAppointment> {
    const response = await auth.fetchProtectedData(`appointment/staff/appointment/${appointment.id}/`, "PUT", appointment);
    expectSuccess(response, auth);
    return response.data;
}