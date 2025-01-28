from django.urls import path
from .views import MessageCreateView, contacts, recent, inbox, sent, read

urlpatterns = [
    path('create/', MessageCreateView.as_view(), name="message_create"),
    path('contacts/', contacts, name='message_contacts'),
    path('recent/', recent, name='message_recent'),
    path('inbox/', inbox, name='message_inbox'),
    path('sent/', sent, name='message_sent'),
    path('read/', read, name='message_read'),
]