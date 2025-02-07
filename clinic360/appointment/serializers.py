from .models import AppointmentSettings, AppointmentDay, Appointment
from rest_framework.exceptions import ValidationError, PermissionDenied
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
        fields = ('appointment_types', 'appointment_slot_duration', 'weekly_schedule', 'day_overrides', 'schedulable_duration', 'schedulable_cutoff_override', 'doctor')

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
    
    def create(self, validated_data):
        existing_settings = AppointmentSettings.objects.filter(doctor=validated_data['doctor'])
        existing_settings.update(active=False)
        return super().create(validated_data)


class AppointmentDaySerializer(serializers.ModelSerializer):
    available_slots = serializers.SerializerMethodField()
    appointments = serializers.SerializerMethodField()

    class Meta:
        model = AppointmentDay
        fields = ('available_slots', 'appointments')
    
    def get_available_slots(self, obj):
        return obj.get_available_slots()
    
    def get_appointments(self, obj):
        user = self.context['request'].user
        if self.context['staff_mode']:
            queryset = Appointment.objects.filter(day=obj, status__in=['PENDING', 'COMPLETE', 'NOSHOW'])
        else:
            queryset = Appointment.objects.filter(patient=user, day=obj, status__in=['PENDING', 'COMPLETE', 'NOSHOW'])
        return AppointmentListSerializer(queryset, many=True).data

class AppointmentListSerializer(serializers.ModelSerializer):
    time = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    patient = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ('id', 'name', 'time', 'duration', 'doctor', 'patient')
    
    def get_time(self, obj) -> datetime:
        settings = obj.day.appointment_settings
        return settings.get_date_time(obj.day.day, obj.time)
    
    def get_duration(self, obj) -> int:
        settings = obj.day.appointment_settings
        return obj.appointment_type.duration * settings.appointment_slot_duration

    def get_doctor(self, obj) -> str:
        if obj.doctor == None:
            return ''
        else:
            obj.doctor.get_full_name()
    
    def get_patient(self, obj) -> str:
        if patient == None:
            return ''
        else:
            return obj.patient.get_full_name()

# Gets the details of an appointment, assuming the client already knows the information from an AppointmentListSerializer
class PatientAppointmentDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ('description', 'status', 'appointment_type')

class StaffAppointmentDetailsSerializer(serializers.ModelSerializer):
    added_by = serializers.SerializerMethodField()
    added_by_role = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = (
            'description',
            'status',
            'internal_notes',
            'appointment_type',
            'added_by',
            'added_by_role',
        )
    
    def get_added_by(self, obj):
        return obj.added_by.get_full_name()
    
    def get_added_by_role(self, obj):
        if obj.added_by == obj.patient:
            return 'patient'
        else:
            return 'staff'

class BaseAppointmentSerializer(serializers.ModelSerializer):
    def validate(self, data):
        with transaction.atomic():
            try:
                data['day'] = AppointmentDay.objects.select_for_update().get(day=data['day'])
            except AppointmentDay.DoesNotExist:
                raise PermissionDenied("You are not allowed to schedule an appointment on this date.")

            available_slots = data['day'].get_available_slots()
            duration = data['appointment_type'].duration
            for i in range(0, duration, data['day'].settings.slot_duration):
                if data['time'] + datetime.timedelta(minutes=i) not in available_slots:
                    raise ValidationError({'time': 'Slot not available.'})
            return data

class PatientAppointmentSerializer(BaseAppointmentSerializer):
    class Meta:
        model = Appointment
        fields = ('day', 'time', 'appointment_type', 'doctor')

    def create(self, validated_data):
        validated_data['name'] = validated_data['appointment_type'].name
        validated_data['added_by'] = self.request['user']
        validated_data['patient'] = self.request['user']
        validated_data['status'] = 'PENDING'
        return super().create(validated_data)

class StaffAppointmentSerializer(BaseAppointmentSerializer):
    class Meta:
        model = Appointment
        fields = ('day', 'time', 'appointment_type', 'name', 'description', 'internal_notes', 'doctor', 'patient')