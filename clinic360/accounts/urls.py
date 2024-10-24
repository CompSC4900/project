from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('create-account/', views.createAccount, name='create-account'),
    path('create-account/ajax/', views.createAccountAjax, name='create-account-ajax'),
]
