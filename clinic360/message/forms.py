from django import forms
from django.contrib.auth import get_user_model
from .models import Message

class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['receiver', 'content']
        widgets = {
            'receiver': forms.Select(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

    def __init__(self, user, *args, **kwargs):
        super().__init__(*args, **kwargs)
        User = get_user_model()  # Dynamically fetch the user model
        self.fields['receiver'].queryset = User.objects.exclude(id=user.id)  # Use the actual model to query users
