from django.http import HttpResponse
from django.template import loader

def login(request):
    template = loader.get_template('login.html')
    return HttpResponse(template.render())

def createAccount(request):
    template = loader.get_template('create-account.html')
    return HttpResponse(template.render())
