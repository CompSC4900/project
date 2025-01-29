from django.db import models
from django.conf import settings

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name='sent_messages', 
        on_delete=models.CASCADE,
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name='received_messages', 
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    content = models.TextField(blank=True)
    subject = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    draft = models.BooleanField()
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} to {self.receiver} at {self.timestamp}"