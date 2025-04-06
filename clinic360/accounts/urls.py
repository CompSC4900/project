from django.urls import path
from .views import verify_email

urlpatterns = [
    path('verify-email/<uidb64>/<token>/', verify_email, name='verify_email'),
]