from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login, name='login'),
    path('create-account/', views.createAccount, name='create-account'),
]
