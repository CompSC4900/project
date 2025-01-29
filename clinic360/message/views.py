from rest_framework.permissions import IsAuthenticated
from accounts.models import Clinic360User
from .models import Message
from .serializers import MessageCreateSerializer, validate_ok_to_send
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from rest_framework import generics
import datetime

def full_name(names_tuple):
    return f"{names_tuple[0]} {names_tuple[1]}"

class MessageCreateView(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MessageCreateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['draft'] = False
        return context

class DraftCreateView(generics.CreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = MessageCreateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['draft'] = True
        return context

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

def get_messages(request, is_incoming, draft, timestamp=None):
    if is_incoming and draft:
        raise ValueError("Attempt to read other user's drafts")
    kwargs = {"draft": draft}
    if is_incoming:
        kwargs["recipient"] = request.user
        other_user_role = "sender"
    else:
        kwargs["sender"] = request.user
        other_user_role = "recipient"
    if timestamp != None:
        kwargs["timestamp"] = timestamp
    messages = Message.objects.filter(**kwargs).values(other_user_role, "subject", "timestamp", "read", "id")
    messages = list(messages)

    user_ids = {msg[other_user_role] for msg in messages}
    users = {}
    for user in Clinic360User.objects.filter(id__in=user_ids):
        users[user.id] = full_name((user.first_name, user.last_name))

    for message in messages:
        other_user = message[other_user_role]
        if other_user == None:
            message[other_user_role] = "No Recipient"
        else:
            message[other_user_role] = users[message[other_user_role]]

    return Response({
        "messages": messages
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent(request):
    past_week = timezone.now() - datetime.timedelta(days=7)
    return get_messages(request, True, False, past_week)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inbox(request):
    return get_messages(request, True, False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sent(request):
    return get_messages(request, False, False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def drafts(request):
    return get_messages(request, False, True)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def read(request):
    try:
        message = Message.objects.get(id=request.data.get("id"))
        if not message.draft and message.recipient.id == request.user.id:
            if not message.read:
                message.read = True
                message.save()
            return Response({'content': message.content})
        elif message.sender.id == request.user.id:
            return Response({
                'content': message.content,
                'recipient_id': message.recipient.id if message.recipient != None else None
            })
        raise PermissionDenied()
    except Message.DoesNotExist:
        raise PermissionDenied()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def draft_update(request, send):
    try:
        message = Message.objects.get(sender=request.user, draft=True, id=request.data.get("id"))
        message.recipient = Clinic360User.objects.get(id=request.data.get('recipient'))
        message.subject = request.data.get('subject')
        message.content = request.data.get('content')
        if send:
            validate_ok_to_send(request.user, message.recipient, message.subject, message.content)
        message.timestamp = timezone.now()
        if send:
            message.draft = False
        message.save()
        return Response({})
    except Message.DoesNotExist:
        raise PermissionDenied()
    except Clinic360User.DoesNotExist:
        raise PermissionDenied()