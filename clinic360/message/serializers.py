from rest_framework import serializers
from .models import Message

class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('recipient', 'content', 'subject')
    
    def validate(self, attrs):
        if not self.context['request'].user.associated_users.contains(attrs['recipient']):
            raise serializers.ValidationError({"recipient": "Unable to send a message to user"})
        if attrs['subject'] == '':
            raise serializers.ValidationError({'subject': 'Subject must not be empty'})
        return attrs

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)