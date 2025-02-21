from celery import Celery
from celery.schedules import crontab
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic360.settings')

app = Celery('clinic360')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
app.conf.broker = 'django://'

app.conf.beat_schedule = {
    'create_appointment_days': {
        'task': 'appointment.tasks.create_appointment_days',
        'schedule': crontab(minute=0, hour='*'),
    },
}