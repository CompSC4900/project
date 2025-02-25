from django.contrib import admin

# Register your models here.
from .models import AppointmentType, AppointmentSettings, AppointmentDay, Appointment

admin.site.register(AppointmentType)
admin.site.register(AppointmentSettings)
admin.site.register(AppointmentDay)
admin.site.register(Appointment)