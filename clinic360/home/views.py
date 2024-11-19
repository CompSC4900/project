from django.http import HttpResponse
from django.template import loader
from calendar360.views import get_events_json

def home(request):
    template = loader.get_template('home.html')
    
    if request.user.is_authenticated:
        events_json = get_events_json(request.user)
    else:
        events_json = "[]"
    
    return HttpResponse(template.render({"events_json": events_json}, request))
