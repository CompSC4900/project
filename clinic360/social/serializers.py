from rest_framework import serializers
from .models import SocialInfo, Condition, FriendRequest, Clinic360User

class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = ('id', 'name')
        read_only_fields = ('id',)

class PatientSocialInfoSerializer(serializers.ModelSerializer):
    conditions = ConditionSerializer(many=True)
    class Meta:
        model = SocialInfo
        fields = ('id', 'user', 'about_me', 'profile_picture', 'public', 'conditions')
        read_only_fields = ('id', 'user', 'conditions') # Only staff can modify conditions
    
    def create(self, validated_data):
        user = self.context['request'].user
        social_info = SocialInfo.objects.create(user=user, **validated_data)
        return social_info

class StaffSocialInfoSerializer(serializers.ModelSerializer):
    conditions = ConditionSerializer(many=True)
    class Meta:
        model = SocialInfo
        fields = ('id', 'user', 'about_me', 'profile_picture', 'public', 'conditions', 'banned')
        read_only_fields = ('id', 'user', 'about_me', 'profile_picture', 'public') # Staff cannot change patient bio or profile picture

class FriendRequestSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    receiver_id = serializers.IntegerField(source='receiver.id')

    class Meta:
        model = FriendRequest
        fields = ('id', 'sender_id', 'receiver_id')
        read_only_fields = ('id', 'sender_id')  # Sender is automatically set to request.user's social info
    
    def validate_receiver_id(self, value):
        try:
            receiver = SocialInfo.objects.get(id=value)
            # Get the sender's social info
            sender = SocialInfo.objects.get(user=self.context['request'].user)
            if receiver.user == self.context['request'].user:
                raise serializers.ValidationError("You cannot send a friend request to yourself")
            return value
        except SocialInfo.DoesNotExist:
            raise serializers.ValidationError("Social info does not exist")

    def create(self, validated_data):
        sender_user = self.context['request'].user
        sender_social = SocialInfo.objects.get(user=sender_user)
        receiver_social = SocialInfo.objects.get(id=validated_data['receiver']['id'])
        
        # Check if users are already friends
        if sender_social.friends.filter(id=receiver_social.id).exists():
            raise serializers.ValidationError("You are already friends with this user")
        
        # Check if a friend request already exists
        if FriendRequest.objects.filter(sender=sender_social, receiver=receiver_social).exists():
            raise serializers.ValidationError("Friend request already sent")
        
        friend_request = FriendRequest.objects.create(
            sender=sender_social,
            receiver=receiver_social
        )
        return friend_request
