from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from datetime import datetime

class Clinic360User(AbstractBaseUser):
    email = models.CharField(max_length=254, unique=True)
    firstName = models.CharField(max_length=50)
    lastName = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    city = models.CharField(max_length=20)
    state = models.CharField(max_length=2)
    zipCode = models.CharField(max_length=5)
    birthDate = models.DateField()
    gender = models.CharField(max_length=1) # 'M' or 'F'
    phoneNumber = models.CharField(max_length=10)
        
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["firstName", "lastName", "address", "city", "state", "zipCode", "birthDate", "gender", "phoneNumber"]
        
    # TODO: full input validation
    def __init__(self, formData=None):
        super().__init__()
        
        if formData != None:
            email = formData["email"]
            firstName = formData["fname"]
            lastName = formData["lname"]
            address = formData["address"]
            city = formData["city"]
            state = formData["state"]
            zipCode = formData["zip"]
            birthDateString = formData["dob"]
            birthDate = datetime.strptime(birthDateString, '%Y-%m-%d').date()
            if formData["gender"] == "male":
                gender = "M"
            elif formData["gender"] == "female":
                gender = "F"
            else:
                raise ValueError()
            phoneNumber = formData["phonenumber"]
            set_password(formData["password"])
