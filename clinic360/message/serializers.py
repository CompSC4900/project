from rest_framework import serializers
from .models import Message
from rest_framework.exceptions import ValidationError

def validate_ok_to_send(user, recipient, subject, content):
        if recipient == None:
            raise ValidationError({'recipient': 'This field may not be null.'})
        elif not user.associated_users.contains(recipient):
            raise ValidationError({"recipient": "Unable to send a message to user."})
        if subject == '':
            raise ValidationError({'subject': 'This field may not be blank.'})
        if content == '':
            raise ValidationError({'content': 'This field may not be blank.'})

class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'recipient', 'content', 'subject')
        read_only_fields = ('id',)
    
    def validate(self, attrs):
        if not self.context['draft']:
            validate_ok_to_send(
                self.context['request'].user,
                attrs['recipient'],
                attrs['subject'],
                attrs['content'],
            )
        return attrs

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        validated_data['draft'] = self.context['draft']
        return super().create(validated_data)