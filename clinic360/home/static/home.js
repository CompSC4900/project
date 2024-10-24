/**
 * Do everything neccesarry to finish loading the homepage after the HTML has
 * rendered. This function should call other functions rather than doing work
 * itself for readability.
 **/
function loadHomepage() {
	loadUserCard();
	loadAppointmentPage();
}

/**
 * Load the username of the user to display it on the homepage.
 * TODO: load profile picture as well
 **/
function loadUserCard() {
	usernameHTML = document.getElementById("username");
	username = window.sessionStorage.getItem("activeUser");
	if (username == undefined) { // if there is no active user, display "Not Logged In"
		username = "Not Logged In"
	}
	usernameHTML.innerText = username;
}

function loadAppointmentPage(){
	// Handle showing the popup when the appointment button is clicked
	const appointmentButton = document.getElementById("appointment-button");
	const closeButton = document.getElementById("closePopup");
	const popup = document.getElementById("popup");

	if (appointmentButton) {
		appointmentButton.addEventListener("click", function() {
			popup.style.display = "flex";
		});
	}

	if (closeButton) {
		closeButton.addEventListener("click", function() {
			popup.style.display = "none";
		});
	}

	// Close the popup when clicking outside of the popup content
	window.addEventListener("click", function(event) {
		if (event.target === popup) {
			popup.style.display = "none";
		}
	});
}