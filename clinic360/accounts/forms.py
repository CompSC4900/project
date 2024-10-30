from django import forms
from django.core.validators import RegexValidator
from django.contrib.auth import password_validation

state_choices = [
    ("AL", "Alabama"),
    ("AK", "Alaska"),
    ("AZ", "Arizona"),
    ("AR", "Arkansas"),
    ("CA", "California"),
    ("CO", "Colorado"),
    ("CT", "Connecticut"),
    ("DE", "Delaware"),
    ("FL", "Florida"),
    ("GA", "Georgia"),
    ("HI", "Hawaii"),
    ("ID", "Idaho"),
    ("IL", "Illinois"),
    ("IN", "Indiana"),
    ("IA", "Iowa"),
    ("KS", "Kansas"),
    ("KY", "Kentucky"),
    ("LA", "Louisiana"),
    ("ME", "Maine"),
    ("MD", "Maryland"),
    ("MA", "Massachusetts"),
    ("MI", "Michigan"),
    ("MN", "Minnesota"),
    ("MS", "Mississippi"),
    ("MO", "Missouri"),
    ("MT", "Montana"),
    ("NE", "Nebraska"),
    ("NV", "Nevada"),
    ("NH", "New Hampshire"),
    ("NJ", "New Jersey"),
    ("NM", "New Mexico"),
    ("NY", "New York"),
    ("NC", "North Carolina"),
    ("ND", "North Dakota"),
    ("OH", "Ohio"),
    ("OK", "Oklahoma"),
    ("OR", "Oregon"),
    ("PA", "Pennsylvania"),
    ("RI", "Rhode Island"),
    ("SC", "South Carolina"),
    ("SD", "South Dakota"),
    ("TN", "Tennessee"),
    ("TX", "Texas"),
    ("UT", "Utah"),
    ("VT", "Vermont"),
    ("VA", "Virginia"),
    ("WA", "Washington"),
    ("WV", "West Virginia"),
    ("WI", "Wisconsin"),
    ("WY", "Wyoming"),
    ("DC", "District of Columbia"),
]

# TODO: convert to UserCreationForm
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
