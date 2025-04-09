from message.models import Message
from django.utils import timezone

def send_appointment_confirmation_message(appointment, local_time_display=None):
    #Extraction for the patient, doctor, appointment type, and date time.
    patient = appointment.patient
    doctor = appointment.doctor
    appointment_type = appointment.appointment_type.name
    logo_url = "http://localhost:8000/static/images/logo.svg"

    # Automatic message when an appointment is scheduled
    patient_content = ( 
        #HTML content for constructing the email and giving the supporting details.
        f"<div style='text-align: center;'>"
        f"<img src='{logo_url}' alt='Clinic360 Logo' style='width: 120px; height: auto; margin-bottom: 20px;' />"
        f"</div>"
        f"<p>Hey {patient.first_name},</p>"
        f"<p>Your appointment has been successfully scheduled! Here are the details:</p>"
        f"<ul>"
        f"<li><b>Provider:</b> {doctor.get_full_name()}</li>"
        f"<li><b>Type:</b> {appointment_type}</li>"
        f"<li><b>Date & Time:</b> {local_time_display}</li>"
        f"</ul>"
        f"<p>Thank you for choosing Clinic360 and see you soon!</p>"
    )

    # Create the message (sender is doctor, recipient is patient)
    Message.objects.create(
        sender=doctor,
        recipient=patient,
        subject="Appointment Confirmation",
        content=patient_content,
        draft=False,
        timestamp=timezone.now(),
    )

    doctor_content = (
        f"<div style='text-align: center;'>"
        f"<img src='{logo_url}' alt='Clinic360 Logo' style='width: 120px; height: auto; margin-bottom: 20px;' />"
        f"</div>"
        f"<p>Hello {doctor.first_name}!</p>"
        f"<p>{patient.get_full_name()} has scheduled an appointment with you:</p>"
        f"<ul>"
        f"<li><b>Type:</b> {appointment_type}</li>"
        f"<li><b>Date & Time:</b> {local_time_display}</li>"
        f"</ul>"
        f"<p>Check your schedule for more details.</p>"
    )

    Message.objects.create(
        sender=patient,
        recipient=doctor,
        subject="New Appointment Scheduled",
        content=doctor_content,
        draft=False,
        timestamp=timezone.now(),
    )
