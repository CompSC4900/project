from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from .models import Clinic360User

def index(request):
    return redirect('login/')

def login(request):
    template = loader.get_template('login.html')
    return HttpResponse(template.render())

def createAccount(request):
    template = loader.get_template('create-account.html')
    return HttpResponse(template.render())

@csrf_exempt # must be csrf exempt because the user is not logged in yet    
def createAccountAjax(request):
    if request.method == "POST":
        formData = request.POST
        try:
            Clinic360User(formData)
            return JsonResponse({}, status=200)
        except ValueError:
            return JsonResponse({"error": ""}, status=400)
            
    
    return JsonResponse({"error": ""}, status=400);
