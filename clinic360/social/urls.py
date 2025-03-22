from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConditionViewSet, PatientSocialInfoViewSet, StaffSocialInfoViewSet, IncomingFriendRequestView, OutgoingFriendRequestView, accept_friend_request, get_friends

router = DefaultRouter()
router.register('conditions', ConditionViewSet, basename='conditions')
router.register('patient', PatientSocialInfoViewSet, basename='patient-social-info')
router.register('staff', StaffSocialInfoViewSet, basename='staff-social-info')

urlpatterns = [
    path('', include(router.urls)),
    path('friends/incoming/', IncomingFriendRequestView.as_view(), name='incoming-friend-requests'),
    path('friends/outgoing/', OutgoingFriendRequestView.as_view(), name='outgoing-friend-requests'),
    path('friends/accept/<int:pk>/', accept_friend_request, name='accept-friend-request'),
    path('friends/', get_friends, name='get-friends'),
]
