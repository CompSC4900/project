function loadCalendarPage() {
    const closeButton = document.getElementById("closePopup");

    if (closeButton) {
        closeButton.addEventListener("click", function(){
            popup.style.display = "none";
        })
    }

    // Close the event popup when clicking outside of the popup content
    window.addEventListener("click", function(event) {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
}