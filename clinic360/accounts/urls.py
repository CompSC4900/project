from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', auth_views.LoginView.as_view(template_name="login.html", next_page="home"), name='login'),
    path('create-account/', views.createAccount, name='create-account'),
]
