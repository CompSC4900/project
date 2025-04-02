from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Clinic360User
from .serializers import CreateAccountSerializer, AccountSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
#Import models and classes from rest_framework and Clinic360.

class CreateAccountView(generics.CreateAPIView):
    queryset = Clinic360User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CreateAccountSerializer

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_info(request):
    if request.method == 'PUT':
        serializer = AccountSerializer(request.user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        serializer = AccountSerializer(request.user)
        return Response(serializer.data)

# API endpoint to return if user is staff or not
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_staff(request):
    is_staff = request.user.is_staff
    return Response({
        "staff": is_staff
    })
