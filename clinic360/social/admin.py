from django.contrib import admin
#Import the specified models.
from .models import SocialInfo, Condition, FriendRequest

#Register the specified models for admin.
admin.site.register(SocialInfo)
admin.site.register(Condition)
admin.site.register(FriendRequest)
