from message.models import Message
from django.utils import timezone

def send_appointment_confirmation_message(appointment):
    patient = appointment.patient
    doctor = appointment.doctor
    appointment_type = appointment.appointment_type.name
    date_time = appointment.day.appointment_settings.combine_date_time(appointment.day.day, appointment.time)
    
    # Automatic message when an appointment is scheduled
    subject = "Appointment Confirmation"
    content = (
        f"<p>Hi <strong>{patient.first_name}</strong>,</p>"

        f"Your appointment has been <strong>successfully scheduled</strong>! Here are the details:<br>"

        f"<ul>"
        f"<li><strong>Provider:</strong> {doctor.get_full_name()}</li>"
        f"<li><strong>Type:</strong> {appointment_type}</li>"
        f"<li><strong>Date & Time:</strong> {date_time.strftime('%A, %B %d, %Y at %I:%M %p')}</li>"
        f"</ul>"

        f"<p>Thank you for choosing Clinic360 and see you soon!</p>"
    )

    # Create the message (sender is doctor, recipient is patient)
    Message.objects.create(
        sender=doctor,
        recipient=patient,
        subject=subject,
        content=content,
        draft=False,
        timestamp=timezone.now(),
    )
