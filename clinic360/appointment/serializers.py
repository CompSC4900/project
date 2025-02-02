from .models import AppointmentSettings, AppointmentDay, Appointment
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from datetime import datetime
from django.utils import timezone

def raise_json_error(field):
    raise ValidationError({field: 'Invalid JSON schema.'})

def validate_schedule(candidate, slot_duration, field):
    if not isinstance(candidate, list):
        raise_json_error(field)
    time_ranges = []
    for time_range in candidate:
        if not isinstance(time_range, dict):
            raise_json_error(field)
        if set(time_range.keys()) != {'start', 'end'}:
            raise_json_error(field)
        try:
            start = datetime.strptime(time_range['start'], '%H:%M').time()
            end = datetime.strptime(time_range['end'], '%H:%M').time()
            if end <= start:
                raise ValidationError({field: 'End times must be after start times.'})
            start_minutes = start.hour * 60 + start.minute
            end_minutes = end.hour * 60 + end.minute
            duration = end_minutes - start_minutes
            if duration % slot_duration != 0:
                raise ValidationError({field: 'Times incompatible with slot duration'})
            for existing_range in time_ranges:
                if start < existing_range['end'] and end > existing_range['start']:
                    raise ValidationError({field: 'Time ranges cannot overlap.'})
            time_ranges.append({'start': start, 'end': end})
        except ValueError:
            raise ValidationError({field: 'Invalid time format.'})

class AppointmentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentSettings
        fields = ('appointment_types', 'appointment_slot_duration', 'weekly_schedule', 'day_overrides', 'schedulable_duration', 'schedulable_cutoff_override')

    def validate_weekly_schedule(self, value):
        slot_duration = self.initial_data.get('appointment_slot_duration')
        if not isinstance(value, list) or len(value) != 7:
            raise_json_error('weekly_schedule')
        for daily_schedule in value:
            validate_schedule(daily_schedule, slot_duration, 'weekly_schedule')
        return value
    
    def validate_day_overrides(self, value):
        slot_duration = self.initial_data.get('appointment_slot_duration')
        if not isinstance(value, dict):
            raise_json_error('day_overrides')
        for day, schedule in value.items():
            try:
                datetime.strptime(day, '%Y-%m-%d')
            except ValueError:
                raise ValidationError({'day_overrides': 'Invalid date format.'})
            validate_schedule(schedule, slot_duration, 'day_overrides')
        return value

# appointment day serializer for patients
class PatientAppointmentDaySerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    appointments = serializers.SerializerMethodField()

    class Meta:
        model = AppointmentDay
        fields = ('available_slots', 'appointments')
    
    def get_available_slots(self, obj):
        settings = obj.appointment_settings
        slots = settings.get_slots_for_day(obj.day)
        slots = [slot for slot in slots if slot >= timezone.now()]

        appointments = Appointment.objects.filter(day=obj, status='PENDING')
        for appointment in appointments:
            time = settings.get_date_time(obj.day, appointment.time)
            filled_slots = []
            for slot_count in range(appointment.appointment_type.duration):
                filled_slots.append(time + timezone.timedelta(minutes=settings.appointment_slot_duration * slot_count))
            slots = [slot for slot in slots if slot not in filled_slots]
        
        return slots
    
    def get_appointments(self, obj):
        user = self.context['request'].user
        queryset = Appointment.objects.filter(patient=user, day=obj, status__in=['PENDING', 'COMPLETE', 'NOSHOW'])
        return AppointmentListSerializer(queryset, many=True).data

class AppointmentListSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ('id', 'name', 'time', 'duration')

    def get_time(self, obj) -> datetime:
        settings = obj.day.appointment_settings
        return settings.get_date_time(obj.day.day, obj.time)
    
    def get_duration(self, obj) -> int:
        settings = obj.day.appointment_settings
        return obj.duration * settings.appointment_slot_duration