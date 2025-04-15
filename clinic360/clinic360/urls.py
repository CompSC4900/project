"""
URL configuration for clinic360 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import CreateAccountView, user_info, is_staff
from appointment.views import save_schedule
from accounts.views import verify_email
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/createaccount/', CreateAccountView.as_view(), name='create_account'),
    path('api/userinfo/', user_info, name='user_info'),
    path('api/is_staff/', is_staff, name='is_staff'), 
    path('api/', include('message.urls')),
    path('api/appointment/', include('appointment.urls')),
    path("api/schedule", save_schedule, name="save_schedule"),
    path('api/social/', include('social.urls')),
    path('api/', include('accounts.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)