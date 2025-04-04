from rest_framework import serializers
from .models import Message
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from accounts.models import Clinic360User

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'recipient', 'content', 'subject', 'draft')
        read_only_fields = ('id',)

    def validate(self, data):
        user = self.context['request'].user
        
        # Get values from data or fall back to the existing instance
        recipient = data.get('recipient')
        subject = data.get('subject')
        content = data.get('content')
        draft = data.get('draft')

        if not draft:
            if recipient is None:
                raise ValidationError({'recipient': 'This field may not be null.'})
            if not user.associated_users.contains(recipient):
                raise ValidationError({'recipient': 'Unable to send a message to user.'})
            if not subject:
                raise ValidationError({'subject': 'This field may not be blank.'})
            if not content:
                raise ValidationError({'content': 'This field may not be blank.'})
            #Error messages if there are blank fields or missing data

        return data

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        validated_data['timestamp'] = timezone.now()
        return super().update(instance, validated_data)

class IncomingMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    #Class to indicate and serialize the sender's name.
    
    class Meta:
        model = Message
        #Serializer based on the message model for the sender
        fields = ('id', 'sender', 'subject', 'timestamp', 'read', 'sender_name')
    
    def get_sender_name(self, obj):
        return obj.sender.get_full_name()

class OutgoingMessageSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()
    #Request for recipient
    
    class Meta:
        model = Message
        #Serializer based on the message model for the recipient
        fields = ('id', 'recipient', 'subject', 'timestamp', 'recipient_name')
    
    def get_recipient_name(self, obj):
        if obj.recipient != None:
            return obj.recipient.get_full_name()
            #If there is a recipient, return the full name.
        else:
            return "No Recipient"
            #Message if there is no recipient.
