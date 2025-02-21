from django.db import models
from django.conf import settings
#The material for designing models with customized settings is imported.

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name='sent_messages', 
        on_delete=models.CASCADE,
    )
    #This class inherits its data from the model import in Django and defines the Message sender.
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        related_name='received_messages', 
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    #The Message recipient is defined here in this class using the same model of import.
    content = models.TextField(blank=True)
    subject = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    draft = models.BooleanField()
    read = models.BooleanField(default=False)
    #The contents of the text, character, date, and boolean fields are defined here using Models and more Boolean statements.

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient} at {self.timestamp}"
        #The string is returned to itself.
