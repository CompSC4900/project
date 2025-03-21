from django.urls import path, include
from .views import (
    AppointmentSettingsView,
    AppointmentDaysView,
    StaffAppointmentDetailsView,
    PatientAppointmentDetailsView,
    PatientAppointmentView,
    StaffAppointmentView,
    RescheduleAppointmentView,
    CancelAppointmentView,
    StaffAppointmentTypeViewSet,
    PatientAppointmentSettingsListView,
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('staff/type', StaffAppointmentTypeViewSet, basename='appointment-type-staff')

urlpatterns = [
    path('', include(router.urls)),
    path('settings/', AppointmentSettingsView.as_view(), name='appointment-settings'),
    path('days/', AppointmentDaysView.as_view(), name='appointment-days'),
    path('staff/details/<int:pk>/', StaffAppointmentDetailsView.as_view(), name='staff-appointment-details'),
    path('patient/details/<int:pk>/', PatientAppointmentDetailsView.as_view(), name='patient-appointment-details'),
    path('patient/appointment/', PatientAppointmentView.as_view(), name='patient-appointment-create'),
    path('patient/settings/', PatientAppointmentSettingsListView.as_view(), name='patient-appointment-settings'),
    path('staff/appointment/', StaffAppointmentView.as_view(), name='staff-appointment-create'),
    path('staff/appointment/<int:pk>/', StaffAppointmentView.as_view(), name='staff-appointment-update'),
    path('reschedule/', RescheduleAppointmentView.as_view(), name='reschedule'),
    path('cancel/<int:pk>/', CancelAppointmentView.as_view(), name='cancel'),
]