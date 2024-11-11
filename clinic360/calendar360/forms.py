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
    appointment_title = forms.CharField(max_length=100)
    time = forms.ChoiceField(choices=time_choices)
    am_pm = forms.ChoiceField(choices=[("AM","AM"),("PM","PM")])