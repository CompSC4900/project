from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Message
from .serializers import MessageSerializer, IncomingMessageSerializer, OutgoingMessageSerializer
from .permissions import MessagePermissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from rest_framework import status, viewsets
import datetime
#Import all of the framework needed for the python code.

class MessageViewSet(viewsets.ModelViewSet):
    #Class for viewing messages based on the serializer and permissions granted by authenticatio.
    permission_classes = (IsAuthenticated, MessagePermissions)
    serializer_class = MessageSerializer
    http_method_names = ['get', 'post', 'put', 'delete']

    def get_queryset(self):
        #Acquires the message list for senders and recipients.
        return Message.objects.filter(
            Q(sender=self.request.user) | 
            Q(recipient=self.request.user, draft=False)
        )
    
    def list(self, request):
        #Create 405 warning if not allowed in status.
        return Response(
            {"detail": "Use /inbox, /sent, or /drafts instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=False, methods=['GET'])
    def contacts(self, request):
        #Finds raw contact list and allows for creation of contacts.
        raw_contacts = request.user.associated_users.all()
        contacts = []
        for contact in raw_contacts:
            contacts.append({"name": contact.get_full_name(), "id": contact.id})
        return Response({
            "contacts": contacts
        })

    @action(detail=False, methods=['GET'])
    def inbox(self, request):
        #Serializer for the inbox.
        queryset = Message.objects.filter(recipient=self.request.user, draft=False)
        serializer = IncomingMessageSerializer(queryset, many=True)
        return Response({"messages": serializer.data})
    
    @action(detail=False, methods=['GET'])
    def sent(self, request):
        #Serializer for set messages
        queryset = Message.objects.filter(sender=self.request.user, draft=False)
        serializer = OutgoingMessageSerializer(queryset, many=True)
        return Response({"messages": serializer.data})
    
    @action(detail=False, methods=['GET'])
    def drafts(self, request):
        #Serializer for the drafts
        queryset = Message.objects.filter(sender=self.request.user, draft=True)
        serializer = OutgoingMessageSerializer(queryset, many=True)
        return Response({"messages": serializer.data})
    
    def retrieve(self, request, pk=None):
        #Retrieve override
        return Response({'content': self.get_object().content})

    def update(self, request, pk=None):
        #Update override
        super().update(request, pk)
        return Response()
        
    def create(self, request):
        #Serializer to create message and check its validity.
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'id': serializer.data['id']},
            status=status.HTTP_201_CREATED,
        )
    
    @action(detail=True, methods=['POST'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        message.read = True
        message.save()
        return Response()
