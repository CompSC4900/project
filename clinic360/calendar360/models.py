from django.db import models
from accounts.models import Clinic360User

class Appointment(models.Model):
    appointment_title = models.CharField(max_length=100)

    time = models.DateTimeField()
    appointment_for = models.ForeignKey(Clinic360User, on_delete=models.CASCADE)

    description = models.CharField(max_length=1000, blank=True)
