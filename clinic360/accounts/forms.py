from django import forms
from django.core.validators import RegexValidator
from django.contrib.auth.forms import UserCreationForm
from .models import Patient

class Clinic360UserCreationForm(UserCreationForm):
    zip_code = forms.CharField(
        validators=[RegexValidator(
            regex=r'^\d{5}$',
            message='Zip code must be 5 digits',
        )],
        max_length=5,
    )
    phone_number = forms.CharField(
        validators=[RegexValidator(
            regex=r'^\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$',
            message='Invalid phone number format. Try XXX-XXX-XXXX',
        )],
        max_length=14,
        min_length=10,
    )

    class Meta:
        model = Patient
        fields = ['email', 'first_name', 'last_name', 'address', 'city', 'state', 'zip_code', 'birth_date', 'gender', 'phone_number', 'password1', 'password2']
        widgets = {
            "birth_date": forms.DateInput(attrs={"type": "date"}),
        }
        
    def clean_phone_number(self):
        uncleaned_number = self.cleaned_data['phone_number']
        cleaned_number = ''.join(filter(str.isdigit, uncleaned_number))
        return cleaned_number
