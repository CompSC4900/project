from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
import datetime
import pytz

class AppointmentSettings(models.Model):
    appointment_types = models.ManyToManyField(AppointmentType)
    appointment_slot_duration = models.IntegerField(validators=[MinValueValidator(5), MaxValueValidator(180)]) # in minutes
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
    schedulable_duration = models.IntegerField(validators=[MinValueValidator(0)])
    schedulable_cutoff_override = models.DateField(blank=True, null=True)
    timezone = models.CharField(max_length=50, default='UTC')

    # Safely combines a date and time and returns it in a timezone-aware format
    def combine_date_time(self, date, time):
        native_datetime = datetime.datetime.combine(date, time)
        tz = pytz.timezone(self.timezone)
        return tz.localize(native_datetime)

    def get_slots_for_day(day):
        schedule = day_overrides.get(day.strftime('%Y-%m-%d'), None)
        if schedule == None:
            weekday = (day.weekday() + 1) % 7 # Convert to Sunday-based week
            schedule = weekly_schedule[weekday]
        
        slots = []
        for time_range in schedule:
            slot = datetime.strptime(time_range['start'], '%H:%M').time()
            end = datetime.strptime(time_range['end'], '%H:%M').time()
            while slot < end:
                slots.append(combine_date_time(day, slot))
                slots += datetime.timedelta(minutes=appointment_slot_duration)
        return slots

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
    duration = models.IntegerField(validators=[MinValueValidator(1)]) # in number of slots
    patient_facing = models.BooleanField() # if true, appointments require a patient and a doctor
    bookable_by = models.ManyToManyField(models.Group)