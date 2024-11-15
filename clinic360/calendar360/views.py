from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from .forms import CreateAppointmentForm

# Create your views here.
def index(request):
    template = loader.get_template("calendar.html")
    return HttpResponse(template.render())

def calendar(request):
    if request.method == 'POST':
        form = CreateAppointmentForm(request.POST)
        if form.is_valid():
            return HttpResponse('Yay!')
    else:
        form = CreateAppointmentForm()

    
    return render(request, "calendar.html", context={"form": form})