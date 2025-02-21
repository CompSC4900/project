from celery import shared_task
from .models import AppointmentSettings, AppointmentDay
from django.utils import timezone
import pytz
from datetime import datetime, timedelta


# Ran every hour to update appointment days
@shared_task
def create_appointment_days():
    create_appointment_days_with_constraints(daily_constraint=True)

# Ran on database migration to create appointment initially
def create_appointment_days_initial():
    create_appointment_days_with_constraints(daily_constraint=False)

def create_appointment_days_with_constraints(daily_constraint=False):
    print("Creating appointment days")
    settings = AppointmentSettings.objects.filter(active=True)
    for setting in settings:
        # Get current time in the setting's timezone
        tz = pytz.timezone(setting.timezone)
        current_time = timezone.now().astimezone(tz)
        
        # Only proceed if it's midnight (00:00) in the setting's timezone
        if daily_constraint and current_time.hour != 0:
            continue
            
        create_appointment_days_for_setting(setting, current_time)

# Creates appointment days for a all the days in a setting's schedule
def create_appointment_days_for_setting(setting, current_time):
        # Calculate the end date based on schedulable duration or override
        start_date = current_time.date()
        if setting.schedulable_cutoff_override:
            end_date = setting.schedulable_cutoff_override
        else:
            end_date = start_date + timedelta(days=setting.schedulable_duration)
            
        # Create appointment days for each date in the range
        current_date = start_date
        while current_date <= end_date:
            AppointmentDay.objects.get_or_create(
                day=current_date,
                appointment_settings=setting
            )
            current_date += timedelta(days=1)