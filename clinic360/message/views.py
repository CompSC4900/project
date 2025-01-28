from rest_framework.permissions import IsAuthenticated
from accounts.models import Clinic360User
from .models import Message
from .serializers import MessageCreateSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from rest_framework import generics
import datetime

def full_name(names_tuple):
    return f"{names_tuple[0]} {names_tuple[1]}"

@permission_classes([IsAuthenticated])
class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageCreateSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def contacts(request):
    raw_contacts = request.user.associated_users.all().values_list('first_name', 'last_name', 'id')
    contacts = []
    for contact in raw_contacts:
        contacts.append({"name": full_name(contact[0:2]), "id": contact[2]})
    return Response({
        "contacts": contacts
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent(request):
    past_week = timezone.now() - datetime.timedelta(days=7)
    messages = Message.objects.filter(recipient=request.user, timestamp__gt=past_week).values("sender", "subject", "timestamp", "read", "id")
    messages = list(messages)
    for message in messages:
        recipient = Clinic360User.objects.get(id=message["sender"])
        message["sender"] = full_name((recipient.first_name, recipient.last_name))
    return Response({
        "messages": messages
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inbox(request):
    messages = Message.objects.filter(recipient=request.user).values("sender", "subject", "timestamp", "read", "id")
    messages = list(messages)
    for message in messages:
        recipient = Clinic360User.objects.get(id=message["sender"])
        message["sender"] = full_name((recipient.first_name, recipient.last_name))
    return Response({
        "messages": messages
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sent(request):
    messages = Message.objects.filter(sender=request.user).values("recipient", "subject", "timestamp", "id")
    messages = list(messages)
    for message in messages:
        recipient = Clinic360User.objects.get(id=message["recipient"])
        message["recipient"] = full_name((recipient.first_name, recipient.last_name))
    return Response({
        "messages": messages
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def read(request):
    try:
        message = Message.objects.get(id=request.data["id"])
        if message.recipient.id == request.user.id:
            if not message.read:
                message.read = True
                message.save()
        elif message.sender.id != request.user.id:
            return NotFound()
        return Response({'content': message.content})
    except Message.DoesNotExist:
        return NotFound()