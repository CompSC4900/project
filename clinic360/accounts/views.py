from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Clinic360User
from .serializers import CreateAccountSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
#Import models and classes from rest_framework and Clinic360.

class CreateAccountView(generics.CreateAPIView):
    queryset = Clinic360User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CreateAccountSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
#Restrictions placed on those who are authenticated to access information.
def user_info(request):
    full_name = request.user.first_name + " " + request.user.last_name
    return Response({
        "name": full_name
    })
    #Defined request for full name in user info.

# API endpoint to return if user is staff or not
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_staff(request):
    is_staff = request.user.is_staff
    return Response({
        "staff": is_staff
    })
