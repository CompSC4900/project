from celery import Celery
from celery.schedules import crontab
import os
#Establish interaction with the operating system and imports celery to run tasks periodically.

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic360.settings')

app = Celery('clinic360')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
app.conf.broker = 'django://'
#Discover task configuration automatically within the celery class.

app.conf.beat_schedule = {
    'create_appointment_days': {
        'task': 'appointment.tasks.create_appointment_days',
        'schedule': crontab(minute=0, hour='*'), 
        #Configure the time the tasks create an appointment by the minute and hour.
    },
}
