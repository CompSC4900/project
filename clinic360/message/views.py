from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.template import loader
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from .models import Message
from .forms import MessageForm

def messages(request):
    if not request.user.is_authenticated:
        return redirect("/login/")

    if request.method == 'POST':
        form = MessageForm(request.user, request.POST)
        if form.is_valid():
            new_message = form.save(commit=False)
            new_message.sender = request.user
            new_message.save()
            return redirect('messages')  # Redirect to refresh the page
    else:
        form = MessageForm(request.user)

    unread_messages = Message.objects.filter(receiver=request.user, read=False)
    read_messages = Message.objects.filter(receiver=request.user, read=True)
    sent_messages = Message.objects.filter(sender=request.user)
    return render(request, 'messages.html', {
        'form': form,
        'unread_messages': unread_messages,
        'read_messages': read_messages,
        'sent_messages': sent_messages,
    })

@require_POST
@login_required
def read_message(request, message_id):
    try:
        message = Message.objects.get(id=message_id, receiver=request.user)
        if not message.read:
            message.read = True
            message.save()
    except Message.DoesNotExist:
        pass # we return success even on failure to prevent leaking information
    
    return JsonResponse({"status": "success"})
    
