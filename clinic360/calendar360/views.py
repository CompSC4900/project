from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from .forms import CreateAppointmentForm
from .models import Appointment
from datetime import timedelta
import json

def get_events_json(user):
    events = []
    appointments = Appointment.objects.filter(appointment_for=user)
    for appointment in appointments:
        end_time = appointment.time + timedelta(minutes=30)
        event = {
            "title": appointment.appointment_title,
            "start": appointment.time.isoformat(),
            "end": end_time.isoformat(),
            "description": appointment.description,
        }
        events.append(event)
    return json.dumps(events)

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
        if 'schedule' in request.GET.dict():
            show_popup = True
        form = CreateAppointmentForm()
        
    events_json = get_events_json(request.user)
    
    return render(request, "calendar.html", context={"events_json": events_json, "show_popup": show_popup, "form": form})
