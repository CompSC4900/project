from django.apps import AppConfig
from django.db.models.signals import post_migrate

class AppointmentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'appointment'

    def ready(self):
        def _post_migrate_handler(sender, **kwargs):
            # Import here to avoid circular imports
            from .tasks import create_appointment_days_initial
            create_appointment_days_initial()

        # Connect to post_migrate signal to ensure DB tables exist
        post_migrate.connect(_post_migrate_handler, sender=self)
