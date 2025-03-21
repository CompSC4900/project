from rest_framework import viewsets
from .models import SocialInfo, Condition
from .serializers import PatientSocialInfoSerializer, StaffSocialInfoSerializer, ConditionSerializer
from rest_framework.permissions import IsAuthenticated, IsStaff

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