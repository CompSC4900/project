from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Clinic360User
from .serializers import CreateAccountSerializer

class CreateAccountView(generics.CreateAPIView):
    queryset = Clinic360User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CreateAccountSerializer