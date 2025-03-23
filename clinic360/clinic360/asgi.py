"""
ASGI config for clinic360 project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
#Import the operating system for functionality.

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic360.settings') #Alters the Django settings for alignment with Clinic360.

application = get_asgi_application()
