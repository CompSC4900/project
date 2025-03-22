from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConditionViewSet, PatientSocialInfoView, StaffSocialInfoViewSet, IncomingFriendRequestView, OutgoingFriendRequestView, accept_friend_request, get_friends, SelfSocialInfoView

router = DefaultRouter()
router.register('conditions', ConditionViewSet, basename='conditions')
router.register('staff', StaffSocialInfoViewSet, basename='staff-social-info')

urlpatterns = [
    path('', include(router.urls)),
    path('friends/incoming/', IncomingFriendRequestView.as_view(), name='incoming-friend-requests'),
    path('friends/outgoing/', OutgoingFriendRequestView.as_view(), name='outgoing-friend-requests'),
    path('friends/accept/<int:pk>/', accept_friend_request, name='accept-friend-request'),
    path('friends/', get_friends, name='get-friends'),
    path('self/', SelfSocialInfoView.as_view(), name='self-social-info'),
    path('patient/', PatientSocialInfoView.as_view(), name='patient-social-info'),
]
