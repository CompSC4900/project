#Import AppConfig from list of Django applications.
from django.apps import AppConfig

#Configuration class from AppConfig.
class SocialConfig(AppConfig):
    #All apps will use BigAutoField as default type.
    default_auto_field = 'django.db.models.BigAutoField'
    #Name used by Django to define location.
    name = 'social'
