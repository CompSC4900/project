from rest_framework import permissions

class MessagePermissions(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        is_sender = obj.sender == request.user
        is_recipient = obj.recipient == request.user

        # Special case for the mark_read action
        if getattr(view, 'action', None) == 'mark_read':
            return is_recipient

        # Read
        if request.method in permissions.SAFE_METHODS:
            if obj.draft:
                return is_sender
            else:
                return is_sender or is_recipient
        
        # Modify
        if request.method in ['PUT', 'PATCH']:
            return is_sender and obj.draft
        
        # Delete
        if request.method == 'DELETE':
            return is_sender and obj.draft