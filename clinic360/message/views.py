from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.template import loader
from django.contrib.auth.decorators import login_required
from .models import Message
from .forms import MessageForm

# Create your views here.
def index(request):
    template = loader.get_template("messages.html")
    return HttpResponse(template.render())

def messages(request):
    if request.user.is_authenticated:
        received_messages = Message.objects.filter(receiver=request.user)
        sent_messages = Message.objects.filter(sender=request.user)
        return render(request, "messages.html", {
            "received_messages": received_messages,
            "sent_messages": sent_messages,
        })
    else:
        return render(request, "messages.html", {"error": "You must be logged in to view messages."})

def messages(request):
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            new_message = form.save(commit=False)
            new_message.sender = request.user
            new_message.save()
            return redirect('messages')  # Redirect to refresh the page
    else:
        form = MessageForm()

    received_messages = Message.objects.filter(receiver=request.user)
    sent_messages = Message.objects.filter(sender=request.user)
    return render(request, 'messages.html', {
        'form': form,
        'received_messages': received_messages,
        'sent_messages': sent_messages,
    })