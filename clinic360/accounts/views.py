from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from .models import Clinic360User
from .forms import CreateAccountForm
from datetime import datetime

def index(request):
    return redirect('/login/')

def login(request):
    template = loader.get_template('login.html')
    return HttpResponse(template.render())

def createAccount(request):
    if request.method == "POST":
        form = CreateAccountForm(request.POST)
        if form.is_valid():
            Clinic360User.objects.create_user(
                form.cleaned_data["email"],
                form.cleaned_data["first_name"],
                form.cleaned_data["last_name"],
                form.cleaned_data["address"],
                form.cleaned_data["city"],
                form.cleaned_data["state"],
                form.cleaned_data["zip_code"],
                form.cleaned_data["birth_date"],
                form.cleaned_data["gender"],
                form.cleaned_data["phone_number"],
                form.cleaned_data["password"],
            )
            return redirect("/login/")
    else:
        form = CreateAccountForm()
        
    return render(request, "create-account.html", context={"form": form})
