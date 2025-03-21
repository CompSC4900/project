from rest_framework import serializers
from .models import SocialInfo, Condition

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