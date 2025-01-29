from django.urls import path
from .views import MessageCreateView, DraftCreateView, contacts, recent, inbox, sent, read, drafts, draft_update

urlpatterns = [
    path('create/', MessageCreateView.as_view(), name="message_create"),
    path('contacts/', contacts, name='message_contacts'),
    path('recent/', recent, name='message_recent'),
    path('inbox/', inbox, name='message_inbox'),
    path('sent/', sent, name='message_sent'),
    path('read/', read, name='message_read'),
    path('draft/', drafts, name='drafts'),
    path('draft/create/', DraftCreateView.as_view(), name="draft_create"),
    path('draft/update/', draft_update, {'send': False}, name="draft_update"),
    path('draft/send/', draft_update, {'send': True}, name='draft_send'),
]