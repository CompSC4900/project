from django.db import models
from django.conf import settings

class AppointmentSettings(models.Model):
    appointment_types = models.ManyToManyField(AppointmentType)
    appointment_slot_duration = models.IntegerField() # in minutes
    weekly_schedule = models.JSONField(
        validators=[JsonSchemaValidator(schema=WeeklySchedule.schema())]
    )
    '''
        interface TimeRange {
            start: TimeString
            end: TimeString
        }
        type Schedule = TimeRange[]
        weekly_schedule: Schedule[7]
    '''
    day_overrides = models.JSONField(
        validators=[JsonSchemaValidator(schema=DayOverrides.schema())]
    )
    '''
        day_overrides: Record<DateString, Schedule>
    '''
    schedulable_duration = models.IntegerField()
    schedulable_cutoff_override = models.DateField(blank=True, null=True)

class AppointmentDay(models.Model):
    day = models.DateField(unique=True)
    appointment_settings = models.ForeignKey(
        AppointmentSettings,
        related_name='appointment_days',
        on_delete=models.PROTECT,
    )

class Appointment(models.Model):
    day = models.ForeignKey(
        AppointmentDay, 
        related_name='appointments', 
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=50)
    description = models.TextField()
    internal_notes = models.TextField()
    time = models.TimeField()
    appointment_type = models.ForeignKey(
        AppointmentType,
        related_name='+',
        on_delete=models.PROTECT,
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='appointments_created',
        on_delete=MODELS.SET_NULL,
        null=True,
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='appointments_as_doctor',
        on_delete=MODELS.CASCADE,
        null=True,
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='appointments_as_patient',
        on_delete=MODELS.CASCADE,
        null=True,
    )
    status = models.CharField(choices={'PENDING': 'Pending', 'COMPLETE': 'Complete', 'NOSHOW': 'No Show', 'CANCELED': 'Canceled', 'RESCHEDULE': 'Rescheduled'}, default='P', max_length=10)
    rescheduled_to = models.ForeignKey(
        Appointment,
        related_name='rescheduled_from',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

class AppointmentType(models.Model):
    name = models.CharField(max_length=50)
    duration = models.IntegerField() # in number of slots
    patient_facing = models.BooleanField() # if true, appointments require a patient and a doctor
    bookable_by = models.ManyToManyField(models.Group)