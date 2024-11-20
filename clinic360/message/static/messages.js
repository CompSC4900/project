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

// Mark the message as read and move it to Past Messages
function markAsRead(messageId, content) {
    // Move message from unread to read
    const unreadMessages = document.getElementById('unreadMessages');
    const readMessages = document.getElementById('readMessages');

    // Find the clicked message
    const messageBox = document.querySelector(`.message-box[onclick*="'${messageId}'"]`);

    if (messageBox) {
        // Remove from Unread Messages
        unreadMessages.removeChild(messageBox);

        // Add to Past Messages
        readMessages.appendChild(messageBox);

        // Update the status badge to "Read"
        const statusBadge = messageBox.querySelector('.status');
        if (statusBadge) {
            statusBadge.textContent = 'Read';
            statusBadge.classList.add('read');
        }
    }

    // Show the message content in the popup
    showMessage(content, messageId);
}