from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from .models import Clinic360User
from datetime import datetime

# https://docs.djangoproject.com/en/5.1/topics/auth/default/#django.contrib.auth.views.LoginView

def index(request):
    return redirect('login/')

def login(request):
    template = loader.get_template('login.html')
    return HttpResponse(template.render())

def createAccount(request):
    template = loader.get_template('create-account.html')
    return HttpResponse(template.render())

def createAccountFromFormData(formData):
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
    password = formData["password"]
    Clinic360User.objects.create_user(email, firstName, lastName, address, city, state, zipCode, birthDate, gender, phoneNumber, password)

@csrf_exempt
def createAccountAjax(request):
    if request.method == "POST":
        try:
            createAccountFromFormData(request.POST)
            return JsonResponse({}, status=200)
        except ValueError:
            return JsonResponse({"error": ""}, status=400)
            
    
    return JsonResponse({"error": ""}, status=400);
