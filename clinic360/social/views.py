from rest_framework import viewsets
from .models import SocialInfo, Condition, FriendRequest
from .serializers import PatientSocialInfoSerializer, StaffSocialInfoSerializer, ConditionSerializer, FriendRequestSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.generics import GenericAPIView, ListCreateAPIView
from rest_framework.mixins import ListModelMixin, DestroyModelMixin, CreateModelMixin
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer
    permission_classes = [IsAdminUser]

class PatientSocialInfoView(GenericAPIView, ListModelMixin):
    queryset = SocialInfo.objects.filter(public=True, banned=False)
    serializer_class = PatientSocialInfoSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

class SelfSocialInfoView(ListCreateAPIView):
    serializer_class = PatientSocialInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SocialInfo.objects.filter(user=self.request.user)

class StaffSocialInfoViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'patch']
    queryset = SocialInfo.objects.all()
    serializer_class = StaffSocialInfoSerializer
    permission_classes = [IsAdminUser]

class IncomingFriendRequestView(GenericAPIView, ListModelMixin, DestroyModelMixin):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_social_info = SocialInfo.objects.get(user=self.request.user)
        return FriendRequest.objects.filter(
            receiver=user_social_info, 
            sender__public=True, 
            sender__banned=False
        )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

class OutgoingFriendRequestView(GenericAPIView, ListModelMixin, CreateModelMixin, DestroyModelMixin):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_social_info = SocialInfo.objects.get(user=self.request.user)
        return FriendRequest.objects.filter(
            sender=user_social_info, 
            receiver__public=True, 
            receiver__banned=False
        )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, pk):
    try:
        user_social_info = SocialInfo.objects.get(user=request.user)
        friend_request = FriendRequest.objects.get(pk=pk, receiver=user_social_info)
        friend_request.sender.friends.add(friend_request.receiver)
        friend_request.receiver.friends.add(friend_request.sender)
        friend_request.delete()
        return Response({"message": "Friend request accepted"})
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request not found"}, status=404)
    except SocialInfo.DoesNotExist:
        return Response({"error": "Social info not found"}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    # Return the ID of all the friends of the user
    try:
        social_info = SocialInfo.objects.get(user=request.user)
        return Response(list(social_info.friends.filter(public=True, banned=False).values_list('id', flat=True)))
    except SocialInfo.DoesNotExist:
        # If the user does not have social info set up, return an empty list
        return Response([])