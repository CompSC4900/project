// Function to show the message content in the modal
function showMessage(content) {
    const modal = document.getElementById('messageModal');
    const messageContent = document.getElementById('messageContent');
    messageContent.textContent = content; // Set the message content
    modal.style.display = 'flex'; // Show the modal
}

// Function to close the modal
function closeMessage() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none'; // Hide the modal
}

function loadMessagesPage() {
    const unreadMessages = document.querySelectorAll('#unreadMessages .message-box');
    const readMessages = document.querySelectorAll('#readMessages .message-box');
    
    unreadMessages.forEach(message => message.addEventListener('click', function handler() {
        // mark as read, show message
        markAsRead(message, message.getAttribute('data-message-id'));
        showMessage(message.getAttribute('data-message-content'));
        // we've already marked as read, now all we need to do is show the message
        message.removeEventListener('click', handler);
        message.addEventListener('click', () => {
            showMessage(message.getAttribute('data-message-content'));
        });
    }));
    
    // only need to show message for read messages
    readMessages.forEach(message => message.addEventListener('click', () => {
        showMessage(message.getAttribute('data-message-content'));
    }));
}

function markAsRead(message, messageId) {
    // Move message from unread to read
    const unreadMessageContainer = document.getElementById('unreadMessages');
    const readMessageContainer = document.getElementById('readMessages');
    unreadMessageContainer.removeChild(message);
    readMessageContainer.prepend(message);

    // Send request to the server to let it know we've read the message
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch(`/messages/${messageId}/read/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        },
    });
}
