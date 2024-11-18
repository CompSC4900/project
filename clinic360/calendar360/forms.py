from django import forms

hour_choices = [
    ("1","1:"),
    ("2","2:"),
    ("3","3:"),
    ("4","4:"),
    ("5","5:"),
    ("6","6:"),
    ("7","7:"),
    ("8","8:"),
    ("9","9:"),
    ("10","10:"),
    ("11","11:"),
    ("12","12:"),
]

minute_choices = [
    ("00","00"),
    ("15","15"),
    ("30","30"),
    ("45","45"),
]

class CreateAppointmentForm(forms.Form):
    appointment_title = forms.CharField(label="Appointment Title", max_length=100)

    start_hour = forms.ChoiceField(label="Start Hour", choices=hour_choices)
    start_minute = forms.ChoiceField(label="Start Minute", choices=minute_choices)
    am_pm1 = forms.ChoiceField(label="am/pm", choices=[("AM","AM"),("PM","PM")])
    start_date = forms.CharField(label="Start Date", max_length=10, widget=forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'}))

    end_hour = forms.ChoiceField(label="End Hour", choices=hour_choices)
    end_minute = forms.ChoiceField(label="End Minute", choices=minute_choices)
    am_pm2 = forms.ChoiceField(label="am/pm", choices=[("AM","AM"),("PM","PM")])
    end_date = forms.CharField(label="End Date", max_length=10, widget=forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'}))