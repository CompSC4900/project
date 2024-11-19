from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from .forms import CreateAppointmentForm
from .models import Appointment
from datetime import timedelta
import json

def calendar(request):
    if not request.user.is_authenticated:
        return redirect("/login/")
        
    show_popup = False
        
    if request.method == "POST":
        form = CreateAppointmentForm(request.POST)
        try:
            form.save(request.user)
            return redirect("/calendar/")
        except ValueError:
            show_popup = True
    else:
        form = CreateAppointmentForm()
        
    events = []
    appointments = Appointment.objects.all()
    for appointment in appointments:
        end_time = appointment.time + timedelta(minutes=30)
        event = {
            "title": appointment.appointment_title,
            "start": appointment.time.isoformat(),
            "end": end_time.isoformat(),
            "description": appointment.description,
        }
        events.append(event)
    events_json = json.dumps(events)
    
    return render(request, "calendar.html", context={"events_json": events_json, "show_popup": show_popup, "form": form})
