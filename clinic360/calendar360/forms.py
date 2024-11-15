from django import forms

time_choices = [
    ("1:00","1:00"),
    ("2:00", "2:00"),
    ("3:00","3:00"),
    ("4:00","4:00"),
    ("5:00","5:00"),
    ("6:00","6:00"),
    ("7:00","7:00"),
    ("8:00","8:00"),
    ("9:00","9:00"),
    ("10:00","10:00"),
    ("11:00","11:00"),
    ("12:00","12:00"),
]

class CreateAppointmentForm(forms.Form):
    appointment_title = forms.CharField(label="Appointment Title", max_length=100)

    start_time = forms.ChoiceField(label="Start Time", choices=time_choices)
    am_pm1 = forms.ChoiceField(label="am/pm", choices=[("AM","AM"),("PM","PM")])
    start_date = forms.CharField(label="Start Date", max_length=10, widget=forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'}))

    end_time = forms.ChoiceField(label="End Time", choices=time_choices)
    am_pm2 = forms.ChoiceField(label="am/pm", choices=[("AM","AM"),("PM","PM")])
    end_date = forms.CharField(label="End Date", max_length=10, widget=forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'}))