from rest_framework import generics, viewsets, mixins
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .serializers import (
    AppointmentSettingsSerializer,
    AppointmentDaySerializer,
    StaffAppointmentDetailsSerializer,
    PatientAppointmentDetailsSerializer,
    PatientAppointmentSerializer,
    StaffAppointmentSerializer,
    AppointmentTypeSerializer,
    AppointmentSettingsListSerializer,
)
from .models import AppointmentSettings, AppointmentDay, Appointment, AppointmentType
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
import pytz
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import json
from django.contrib.auth import get_user_model

class StaffAppointmentTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows administrators (staff) to manage appointment types.
    This includes listing, creating, updating, and deleting appointment types.
    """
    queryset = AppointmentType.objects.all()
    permission_classes = (IsAdminUser,)
    serializer_class = AppointmentTypeSerializer

class AppointmentSettingsView(generics.ListCreateAPIView):
    queryset = AppointmentSettings.objects.filter(active=True)
    permission_classes = (IsAdminUser,)
    serializer_class = AppointmentSettingsSerializer

class PatientAppointmentSettingsListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = AppointmentSettingsListSerializer

    def get_queryset(self):
        doctor = self.request.query_params.get('doctor')
        if not doctor:
            raise ValidationError({'doctor': 'Doctor is required.'})
        """
        if not self.request.user.associated_users.filter(id=doctor).exists():
            raise PermissionDenied()
        """
        settings = AppointmentSettings.objects.filter(active=True, doctor=doctor)
        if settings.count() > 1:
            raise ValidationError({'doctor': 'Multiple active settings found for doctor.'}, code='internal_error')
        return settings

class AppointmentDaysView(generics.ListAPIView):
    """
    API endpoint that retrieves **available appointment days** for a given month and year.
    Patients can only view appointment days for doctors they are associated with.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = AppointmentDaySerializer

    def get_queryset(self):
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        
        if not month:
            raise ValidationError({'month': 'Month is required.'})
        if not year:
            raise ValidationError({'year': 'Year is required.'})
        
        query = Q(day__month=month, day__year=year)
        #if not self.request.user.is_staff:
            #query &= Q(appointment_settings__doctor__in=self.request.user.associated_users.all())
        return AppointmentDay.objects.filter(query)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['staff_mode'] = self.request.user.is_staff
        return context

class StaffAppointmentDetailsView(generics.RetrieveAPIView):
    """
    API endpoint that allows staff to **retrieve appointment details**.
    """
    queryset = Appointment.objects.all()
    permission_classes = (IsAdminUser,)
    serializer_class = StaffAppointmentDetailsSerializer

class PatientAppointmentDetailsView(generics.RetrieveAPIView):
    """
    API endpoint that allows **authenticated patients** to retrieve their own appointment details.
    Patients can only access their own **PENDING, COMPLETED, or NO-SHOW** appointments.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PatientAppointmentDetailsSerializer

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user,
            status__in=['PENDING', 'COMPLETE', 'NOSHOW'],
            day__appointment_settings__doctor__in=self.request.user.associated_users.all()
        )

class PatientAppointmentView(generics.CreateAPIView):
    """
    API endpoint for **patients** to book new appointments.
    Appointments created here are initially marked as **PENDING**.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PatientAppointmentSerializer

    def get_queryset(self):
        return Appointment.objects.filter(added_by=self.request.user, status='PENDING')
    
    @transaction.atomic
    def create(self, request):
        return super().create(request)

class StaffAppointmentView(generics.GenericAPIView, mixins.CreateModelMixin, mixins.UpdateModelMixin):
    """
    API endpoint for **staff members** to manage appointments.
    - Staff can create new appointments.
    - Staff can update existing appointments.
    """
    queryset = Appointment.objects.all()
    permission_classes = (IsAdminUser,)
    serializer_class = StaffAppointmentSerializer

    @transaction.atomic
    def create(self, request):
        return super().create(request)

    @transaction.atomic
    def update(self, request, pk):
        return super().update(request, pk)

def get_reschedulable_appointments(user):
    """
    Helper function to retrieve **reschedulable** appointments for a patient.
    An appointment can be rescheduled **if the reschedule window has not yet expired**.
    """
    appointments = Appointment.objects.filter(
        patient=user, 
        status='PENDING'
    ).select_related('day__appointment_settings')
    
    now = timezone.now()
    return [
        apt for apt in appointments
        if apt.day.day >= (
            now.astimezone(pytz.timezone(apt.day.appointment_settings.timezone))
        ).date() + timedelta(days=apt.day.appointment_settings.reschedule_window)
    ]

class RescheduleAppointmentView(generics.CreateAPIView):
    """
    API endpoint that allows **patients** to reschedule appointments.
    - The new appointment is created, and the old one is marked as **RESCHEDULED**.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PatientAppointmentSerializer

    def get_queryset(self):
        return get_reschedulable_appointments(self.request.user)

    @transaction.atomic
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        Appointment.objects.filter(id=serializer.data['id']).update(status='RESCHEDULE', rescheduled_to=serializer.data['id'])
        return Response(serializer.data)

class CancelAppointmentView(generics.DestroyAPIView):
    """
    API endpoint that allows **patients** to cancel their appointments.
    Canceled appointments are marked as **CANCELED** instead of being deleted.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = PatientAppointmentSerializer

    def get_queryset(self):
        return get_reschedulable_appointments(self.request.user)

    def destroy(self, request, pk):
        appointment = self.get_object()
        appointment.status = 'CANCELED'
        appointment.save()
        return Response()

# function to save scheduling availability set in the availability tab.
@csrf_exempt  # <-- Just in case: if this is ever deployed to production status, this should be changed in favor of proper CSRF protection
def save_schedule(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Received data:", data)
            # overrides = data.get("overrides", {})

            # TODO: save the schedule via Django model, 
            # we might have to do some serious processing of the 'blocked' variable because it's in a form I'm not sure has been accounted for
            # Example: Schedule.objects.create(user=request.user, blocked_data=blocked)

            return JsonResponse({"message": "Schedule saved successfully"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=405)
User = get_user_model()

class AvailableProvidersView(APIView):
    """
    Returns a list of providers (doctors) with active appointment settings.
    Includes doctor ID, first name, and last name.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all doctors (is_staff=True) who have active appointment settings
        doctors = User.objects.filter(
            is_staff=True,
            doctor_appointment_settings__active=True
        ).distinct()

        # Format the response with ID, first name, and last name
        provider_list = [
            {"id": doctor.id, "first_name": doctor.first_name, "last_name": doctor.last_name}
            for doctor in doctors
        ]

        return Response(provider_list)
