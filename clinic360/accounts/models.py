from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

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

class Clinic360UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, address, city, state, zip_code, birth_date, gender, phone_number, password):
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            birth_date=birth_date,
            gender=gender,
            phone_number=phone_number,
        )
        user.set_password(password)
        user.save()
        return user
        
    def create_superuser(self, email, first_name, last_name, address, city, state, zip_code, birth_date, gender, phone_number, password):
        email = self.normalize_email()
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            birth_date=birth_date,
            gender=gender,
            phone_number=phone_number,
            is_staff=True,
            is_superuser=True,
        )
        user.set_password(password)
        user.save()
        return user

class Clinic360User(AbstractBaseUser):
    email = models.CharField(max_length=254, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    city = models.CharField(max_length=20)
    state = models.CharField(max_length=2, choices=state_choices)
    zip_code = models.CharField(max_length=5)
    birth_date = models.DateField()
    gender = models.CharField(max_length=1, choices=[("M", "Male"), ("F", "Female")])
    phone_number = models.CharField(max_length=10)
    
    objects = Clinic360UserManager()
        
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "address", "city", "state", "zip_code", "birth_date", "gender", "phone_number"]
