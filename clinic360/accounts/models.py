from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Clinic360UserManager(BaseUserManager):
    def create_user(self, email, firstName, lastName, address, city, state, zipCode, birthDate, gender, phoneNumber, password):
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            firstName=firstName,
            lastName=lastName,
            address=address,
            city=city,
            state=state,
            zipCode=zipCode,
            birthDate=birthDate,
            gender=gender,
            phoneNumber=phoneNumber,
        )
        user.set_password(password)
        user.save()
        return user
        
    def create_superuser(self, email, firstName, lastName, address, city, state, zipCode, birthDate, gender, phoneNumber, password):
        email = self.normalize_email()
        user = self.model(
            email=email,
            firstName=firstName,
            lastName=lastName,
            address=address,
            city=city,
            state=state,
            zipCode=zipCode,
            birthDate=birthDate,
            gender=gender,
            phoneNumber=phoneNumber,
            is_staff=True,
            is_superuser=True,
        )
        user.set_password(password)
        user.save()
        return user

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
    
    objects = Clinic360UserManager()
        
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["firstName", "lastName", "address", "city", "state", "zipCode", "birthDate", "gender", "phoneNumber"]
