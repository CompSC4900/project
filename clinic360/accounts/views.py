from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from .models import Clinic360User
from .forms import Clinic360UserCreationForm

def index(request):
    return redirect('/login/')

def login(request):
    template = loader.get_template('login.html')
    return HttpResponse(template.render())

def createAccount(request):
    if request.method == "POST":
        form = Clinic360UserCreationForm(request.POST)
        try:
            print("success")
            form.save()
            return redirect("/login/")
        except ValueError:
            print("error")
            pass
    else:
        form = Clinic360UserCreationForm()
        
    return render(request, "create-account.html", context={"form": form})
