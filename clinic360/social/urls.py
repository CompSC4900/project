from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('conditions', views.ConditionViewSet)
router.register('patient', views.PatientSocialInfoViewSet)
router.register('staff', views.StaffSocialInfoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
