from rest_framework import permissions

class AppointmentPermissions(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # TODO