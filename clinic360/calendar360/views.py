from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from .forms import CreateAppointmentForm

def calendar(request):
    if not request.user.is_authenticated:
        return redirect("/login/")
        
    if request.method == "POST":
        form = CreateAppointmentForm(request.POST)
        try:
            form.save(request.user)
            return redirect("/calendar/")
        except ValueError:
            pass
    else:
        form = CreateAppointmentForm()
        
    return render(request, "calendar.html", context={"form": form})
