from django.db import models
from accounts.models import Clinic360User

class Condition(models.Model):
    name = models.CharField(max_length=255)

class SocialInfo(models.Model):
    public = models.BooleanField(default=False)
    banned = models.BooleanField(default=False)
    user = models.OneToOneField(Clinic360User, on_delete=models.CASCADE)
    conditions = models.ManyToManyField(Condition, blank=True)
    about_me = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    friends = models.ManyToManyField('self', blank=True)

class FriendRequest(models.Model):
    sender = models.ForeignKey(SocialInfo, on_delete=models.CASCADE, related_name='friend_requests_sent')
    receiver = models.ForeignKey(SocialInfo, on_delete=models.CASCADE, related_name='friend_requests_received')
    
    class Meta:
        unique_together = ('sender', 'receiver')