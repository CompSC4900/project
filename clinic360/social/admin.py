from django.contrib import admin
from .models import SocialInfo, Condition, FriendRequest

admin.site.register(SocialInfo)
admin.site.register(Condition)
admin.site.register(FriendRequest)