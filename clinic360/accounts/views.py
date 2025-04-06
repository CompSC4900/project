from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Clinic360User
from .serializers import CreateAccountSerializer, AccountSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.mail import send_mail
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.shortcuts import redirect
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import login
from .tokens import email_verification_token
from rest_framework_simplejwt.tokens import RefreshToken


#Import models and classes from rest_framework and Clinic360.

class CreateAccountView(generics.CreateAPIView):
    queryset = Clinic360User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CreateAccountSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_active=False)
        token = email_verification_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Make a link to your Django backend’s verification endpoint
        relative_link = reverse('verify_email', kwargs={'uidb64': uid, 'token': token})
        verification_url = f'http://localhost:8000{relative_link}'  # or wherever Django runs

        subject = 'Verify Your Email Address'
        message = (
            f'Hello {user.first_name},\n\n'
            f'Please click the link below to verify your email address:\n'
            f'{verification_url}\n\n'
            f'Thank you!'
        )

        from_email = 'clinic360notifications@gmail.com'
        recipient_list = [user.email]
    
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = Clinic360User.objects.get(pk=uid)
    except Exception:
        return Response({"error": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)

    if email_verification_token.check_token(user, token):
        user.is_active = True
        user.save()

        # Generate the tokens for this user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Construct a URL that includes the tokens as query params
        # Adjust the domain/port/path if your front end is hosted elsewhere.
        frontend_url = (
            f"http://localhost:5173/login" 
            f"?access={access_token}&refresh={refresh_token}"
        )

        # Redirect to the React app with tokens in the query
        return redirect(frontend_url)
    else:
        return Response({"error": "Verification link is invalid or expired."},
                        status=status.HTTP_400_BAD_REQUEST)

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
