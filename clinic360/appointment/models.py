from django.db import models
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime, timedelta
import pytz
from django.utils import timezone

class AppointmentType(models.Model):
    name = models.CharField(max_length=50)
    duration = models.IntegerField(validators=[MinValueValidator(1)]) # in number of slots
    patient_facing = models.BooleanField() # if true, appointments require a patient and a doctor
    # bookable_by = models.ManyToManyField(models.Group) # TODO: maybe think about this later

class AppointmentSettings(models.Model):
    appointment_types = models.ManyToManyField(AppointmentType)
    appointment_slot_duration = models.IntegerField(validators=[MinValueValidator(5), MaxValueValidator(180)]) # in minutes
    weekly_schedule = models.JSONField()
    '''
        interface TimeRange {
            start: TimeString
            end: TimeString
        }
        type Schedule = TimeRange[]
        weekly_schedule: Schedule[7]
    '''
    day_overrides = models.JSONField()
    '''
        day_overrides: Record<DateString, Schedule>
    '''
    schedulable_duration = models.IntegerField(validators=[MinValueValidator(0)])
    schedulable_cutoff_override = models.DateField(blank=True, null=True)
    timezone = models.CharField(max_length=50, default='UTC')
    reschedule_window = models.IntegerField(validators=[MinValueValidator(0)])
    active = models.BooleanField(default=True)
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='doctor_appointment_settings',
        on_delete=models.CASCADE,
    )

    # Safely combines a date and time and returns it in a timezone-aware format
    def combine_date_time(self, date, time):
        native_datetime = datetime.combine(date, time.replace(second=0, microsecond=0))
        tz = pytz.timezone(self.timezone)

        if native_datetime.tzinfo is not None:
            return native_datetime.astimezone(tz)
        return tz.localize(native_datetime)


    def get_slots_for_day(self, day):
        schedule = self.day_overrides.get(day.strftime('%Y-%m-%d'), None)
        if schedule == None:
            weekday = (day.weekday() + 1) % 7 # Convert to Sunday-based week
            schedule = self.weekly_schedule[weekday]
        
        slots = []
        for time_range in schedule:
            slot = self.combine_date_time(day, datetime.strptime(time_range['start'], '%H:%M').time())
            end = self.combine_date_time(day, datetime.strptime(time_range['end'], '%H:%M').time())
            while slot < end:
                slots.append(slot)
                slot += timedelta(minutes=self.appointment_slot_duration)
        return slots

class AppointmentDay(models.Model):
    day = models.DateField()
    appointment_settings = models.ForeignKey(
        AppointmentSettings,
        related_name='appointment_days',
        on_delete=models.PROTECT,
    )

    class Meta:
        unique_together = ('day', 'appointment_settings')

    def get_available_slots(self):
        settings = self.appointment_settings
        slots = settings.get_slots_for_day(self.day)
        slots = [slot for slot in slots if slot >= timezone.now()]

        # Note: This query should be used within a transaction with select_for_update()
        appointments = Appointment.objects.filter(day=self, status='PENDING')
        for appointment in appointments:
            time = settings.combine_date_time(self.day, appointment.time)
            filled_slots = []
            for slot_count in range(appointment.appointment_type.duration):
                filled_slots.append(time + timezone.timedelta(minutes=settings.appointment_slot_duration * slot_count))
            slots = [slot for slot in slots if slot not in filled_slots]
        
        return slots

class Appointment(models.Model):
    day = models.ForeignKey(
        AppointmentDay, 
        related_name='appointments', 
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)
    time = models.TimeField()
    appointment_type = models.ForeignKey(
        AppointmentType,
        related_name='+',
        on_delete=models.PROTECT,
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='appointments_created',
        on_delete=models.SET_NULL,
        null=True,
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='appointments_as_doctor',
        on_delete=models.CASCADE,
        null=True,
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='appointments_as_patient',
        on_delete=models.CASCADE,
        null=True,
    )
    status = models.CharField(choices=[
        ('PENDING', 'Pending'),
        ('COMPLETE', 'Complete'),
        ('NOSHOW', 'No Show'),
        ('CANCELED', 'Canceled'),
        ('RESCHEDULE', 'Rescheduled')
    ], default='PENDING', max_length=10)
    rescheduled_to = models.ForeignKey(
        'self',
        related_name='rescheduled_from',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )