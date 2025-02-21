from django.apps import AppConfig
#Pulled from the Django app configuration class.


class MessageConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'message'
#Defines a class with a string named message. This allows for the app to be controlled based on the string.
