#Import Django modules.
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConditionViewSet, PatientSocialInfoView, StaffSocialInfoViewSet, IncomingFriendRequestView, OutgoingFriendRequestView, accept_friend_request, get_friends, SelfSocialInfoView, remove_friend

#Router intialization.
router = DefaultRouter()
#Registers the conditions and staff endpoints.
router.register('conditions', ConditionViewSet, basename='conditions')
router.register('staff', StaffSocialInfoViewSet, basename='staff-social-info')

#Make an array for URL patterns.
urlpatterns = [
    #Most of these paths are for friend requests and the URLs for engaging with them.
    path('', include(router.urls)),
    path('friends/incoming/', IncomingFriendRequestView.as_view(), name='incoming-friend-requests'),
    path('friends/incoming/<int:pk>/', IncomingFriendRequestView.as_view(), name='incoming-friend-request-detail'),
    path('friends/outgoing/', OutgoingFriendRequestView.as_view(), name='outgoing-friend-requests'),
    path('friends/outgoing/<int:pk>/', OutgoingFriendRequestView.as_view(), name='outgoing-friend-request-detail'),
    path('friends/accept/<int:pk>/', accept_friend_request, name='accept-friend-request'),
    path('friends/remove/<int:pk>/', remove_friend, name='remove-friend'),
    path('friends/', get_friends, name='get-friends'),
    path('self/', SelfSocialInfoView.as_view(), name='self-social-info'),
    path('patient/', PatientSocialInfoView.as_view(), name='patient-social-info'),
]
