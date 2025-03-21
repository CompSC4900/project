from django.urls import path, include
from .views import MessageViewSet
from rest_framework.routers import DefaultRouter
#Import Django classes and frameworks.

router = DefaultRouter()
# Creating a router instance to generate URL patterns
router.register('message', MessageViewSet, basename='message')

#Defining url patterns with the router path and url.
urlpatterns = [
    path('', include(router.urls))
]
