from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from .forms import CreateAppointmentForm

# Helper Functions

# If the appointment was scheduled for afternoon, at 12 to the hour value. 
# Also converts this value to a string and adds a 0 to the front if if is only 1 digit. 
def applyPMOffset(time, am_pm):
    time = int(time)
    if time == 12:
        if am_pm == 'AM':
            correct_time = 0
        elif am_pm == 'PM':
            correct_time = 12
    elif am_pm == 'AM':
        correct_time = time
    elif am_pm == 'PM':
        correct_time = time + 12
    
    correct_time = str(correct_time)

    if len(correct_time) == 1:
        correct_time = '0' + correct_time
    
    return correct_time





# View Functions
def index(request):
    template = loader.get_template("calendar.html")
    return HttpResponse(template.render())

def calendar(request):
    if request.method == 'POST':
        form = CreateAppointmentForm(request.POST)
        if form.is_valid():

            # Processing Appointment Form Input into the format of '2024-10-23T15:00:00'

            formData = (form.cleaned_data).copy()

            startHour = applyPMOffset(formData['start_hour'], formData['am_pm1'])
            endHour = applyPMOffset(formData['end_hour'], formData['am_pm2'])

            startTime = formData['start_date'] + "T" + startHour + ":" + formData['start_minute'] + ":00"
            endTime = formData['end_date'] + "T" + endHour + ":" + formData['end_minute'] + ":00"



            return HttpResponse('Start Time: ' + startTime + '\nEnd Time: ' + endTime)
    else:
        form = CreateAppointmentForm()

    
    return render(request, "calendar.html", context={"form": form})