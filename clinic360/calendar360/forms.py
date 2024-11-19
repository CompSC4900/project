from django import forms
from .models import Appointment
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

min_notice = timedelta(weeks=1) # require 1 week of notice for scheduled appointments

class CreateAppointmentForm(forms.ModelForm):
    class Meta:
        model = Appointment
        exclude = ["appointment_for"]
        widgets = {
            "time": forms.DateInput(attrs={"type": "datetime-local"})
        }

    def clean_time(self):
        time = self.cleaned_data["time"]
        current_date = datetime.now(ZoneInfo("UTC"))
        if time < current_date + min_notice:
            raise ValidationError("Must schedule an appointment at least a week in advance.")
        return time
    
    def save(self, user):
        instance = super().save(commit=False)
        instance.appointment_for = user
        instance.save()
        return instance
