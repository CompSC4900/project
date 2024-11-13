from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

# Create your views here.
def index(request):
    template = loader.get_template("messages.html")
    return HttpResponse(template.render())

def messages(request):
    template = loader.get_template("messages.html")
    return HttpResponse(template.render())
