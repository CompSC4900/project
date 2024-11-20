from django.urls import path
from . import views

urlpatterns = [
    path('messages/', views.messages, name="messages"),
    path('messages/<int:message_id>/read/', views.read_message, name="read_message")
]
