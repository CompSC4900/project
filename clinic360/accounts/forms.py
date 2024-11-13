from django import forms
from django.core.validators import RegexValidator
from django.contrib.auth.forms import UserCreationForm
from .models import Clinic360User

# TODO: convert to UserCreationForm
'''
class CreateAccountForm(forms.Form):
    first_name = forms.CharField(max_length=50)
    last_name = forms.CharField(max_length=50)
    address = forms.CharField(max_length=50)
    city = forms.CharField(max_length=20)
    state = forms.ChoiceField(choices=state_choices)
    zip_code = forms.CharField(
        validators=[RegexValidator(
            regex=r'^\d{5}$',
            message='Zip code must be 5 digits',
        )],
        max_length=5,
        min_length=5,
    )
    birth_date = forms.DateField(widget=forms.DateInput(attrs={"type": "date"}))
    gender = forms.ChoiceField(choices=[("M", "Male"), ("F", "Female")])
    phone_number = forms.CharField(
        validators=[RegexValidator(
            regex=r'^\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$',
            message='Invalid phone number format. Try XXX-XXX-XXXX',
        )],
        max_length=14,
        min_length=10,
    )
    email = forms.EmailField()
    password = forms.CharField(
        widget=forms.PasswordInput(),
        min_length=8,
        validators=[password_validation.validate_password],
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(),
        min_length=8,
        label="Retype password",
    )
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        password2 = cleaned_data.get("password2")
        if password != password2:
            self.add_error("password2", "Passwords do not match")
        return cleaned_data
'''

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
        model = Clinic360User
        fields = ['email', 'first_name', 'last_name', 'address', 'city', 'state', 'zip_code', 'birth_date', 'gender', 'phone_number', 'password1', 'password2']
        widgets = {
            "birth_date": forms.DateInput(attrs={"type": "date"}),
        }
        
    def clean_phone_number(self):
        uncleaned_number = self.cleaned_data['phone_number']
        cleaned_number = ''.join(filter(str.isdigit, uncleaned_number))
        return cleaned_number
