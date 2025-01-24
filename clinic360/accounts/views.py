from rest_framework import generics
from rest_framework.permissions import AllowAny

class CreateAccountView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CreateAccountSerializer