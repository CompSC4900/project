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
        fields = ('id', 'about_me', 'profile_picture', 'public', 'conditions')
        read_only_fields = ('id', 'conditions') # Only staff can modify conditions

class StaffSocialInfoSerializer(serializers.ModelSerializer):
    conditions = ConditionSerializer(many=True)
    class Meta:
        model = SocialInfo
        fields = ('id', 'about_me', 'profile_picture', 'public', 'conditions', 'banned')
        read_only_fields = ('id', 'about_me', 'profile_picture', 'public') # Staff cannot change patient bio or profile picture

class FriendRequestSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    receiver_id = serializers.IntegerField(source='receiver.id')

    class Meta:
        model = FriendRequest
        fields = ('id', 'sender_id', 'receiver_id')
        read_only_fields = ('id', 'sender_id')  # Sender is automatically set to request.user
    
    def validate_receiver_id(self, value):
        try:
            receiver = Clinic360User.objects.get(id=value)
            if receiver == self.context['request'].user:
                raise serializers.ValidationError("You cannot send a friend request to yourself")
            return value
        except Clinic360User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")

    def create(self, validated_data):
        sender_user = self.context['request'].user
        receiver_user = Clinic360User.objects.get(id=validated_data['receiver']['id'])
        
        # Get SocialInfo objects for checking friendship
        sender_social = SocialInfo.objects.get(user=sender_user)
        receiver_social = SocialInfo.objects.get(user=receiver_user)
        
        # Check if users are already friends
        if sender_social.friends.filter(id=receiver_social.id).exists():
            raise serializers.ValidationError("You are already friends with this user")
        
        # Check if a friend request already exists
        if FriendRequest.objects.filter(sender=sender_user, receiver=receiver_user).exists():
            raise serializers.ValidationError("Friend request already sent")
        
        friend_request = FriendRequest.objects.create(
            sender=sender_user,
            receiver=receiver_user
        )
        return friend_request
