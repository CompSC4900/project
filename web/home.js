/**
 * Do everything neccesarry to finish loading the homepage after the HTML has
 * rendered. This function should call other functions rather than doing work
 * itself for readability.
 **/
function loadHomepage() {
	loadUserCard();
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
