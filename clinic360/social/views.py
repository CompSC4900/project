from rest_framework import viewsets
from .models import SocialInfo, Condition, FriendRequest
from .serializers import PatientSocialInfoSerializer, StaffSocialInfoSerializer, ConditionSerializer, FriendRequestSerializer
from rest_framework.permissions import IsAuthenticated, IsStaff
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import ListModelMixin, DestroyModelMixin, CreateModelMixin
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

class ConditionViewSet(viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer
    permission_classes = [IsStaff]

class PatientSocialInfoViewSet(viewsets.ModelViewSet):
    queryset = SocialInfo.objects.filter(public=True, banned=False)
    serializer_class = PatientSocialInfoSerializer
    permission_classes = [IsAuthenticated]

class StaffSocialInfoViewSet(viewsets.ModelViewSet):
    queryset = SocialInfo.objects.all()
    serializer_class = StaffSocialInfoSerializer
    permission_classes = [IsStaff]

class IncomingFriendRequestView(GenericAPIView, ListModelMixin, DestroyModelMixin):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(
            receiver=self.request.user, 
            sender__socialinfo__public=True, 
            sender__socialinfo__banned=False
        )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

class OutgoingFriendRequestView(GenericAPIView, ListModelMixin, CreateModelMixin, DestroyModelMixin):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(sender=self.request.user, receiver__public=True, receiver__banned=False)

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
        friend_request = FriendRequest.objects.get(pk=pk, receiver=request.user)
        friend_request.sender.friends.add(friend_request.receiver)
        friend_request.receiver.friends.add(friend_request.sender)
        friend_request.delete()
        return Response({"message": "Friend request accepted"})
    except FriendRequest.DoesNotExist:
        return Response({"error": "Friend request not found"}, status=404)

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