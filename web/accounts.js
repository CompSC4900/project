/**
 * Validate the email and password pair from the HTML elements with ids "email"
 * and "password". If validation is successful, update local storage to
 * indicate the user is logged in and redirect them to the homepage, otherwise
 * display an error message.
 * TODO: server side validation, password encryption
 **/
function login() {
	const failureMessage = "Invalid email or password";
	// get the email and password from HTML
	let email = document.getElementById("email").value;
	let password = document.getElementById("password").value;
	// get the list of users from local storage
	let usersJSON = window.sessionStorage.getItem("users");
	if (usersJSON == null) {
		displayMessage(failureMessage);
		return;
	}
	let users = JSON.parse(window.sessionStorage.getItem("users"));
	// try to find a user with a matching username and password
	for (user of users) {
		if (user.email == email && user.password == password) {
			// set the active user to the user we found
			window.sessionStorage.setItem("activeUser", user.username);
			// redirect to the home page
			window.location.href = "home.html";
			return;
		}
	}
	// we did not find a matching user
	displayMessage(failureMessage);
}

/**
 * Extract the new account's username, email, and password from the elements
 * with corresponding ids. Make sure that the email and username are unique,
 * and that the password matches the text in the element with id "password2".
 * If all this succeeds, log the user in, otherwise, display an error message.
 * TODO: strong password validation (and duplicate server-side code)
 * TODO: email verification + convert emails to lowercase because emails are case insensitive
 **/
function createAccount() {
	// stuff we need to pull from the HTML
	let requirements = ["username", "email", "password", "password2"];
	// "user" object with "requirements" as keys
	let user = {};
	// get the requirements
	requirements.forEach(requirement => {
		requirementHTML = document.getElementById(requirement);
		user[requirement] = requirementHTML.value;
	});
	// make sure passwords match
	if (user.password != user.password2) {
		displayMessage("Passwords do not match");
		return;
	}
	delete user.password2;
	// now that we've validated everything, we can attempt to add the user to the database
	if (!addUser(user)) {
		return //username or email is a duplicate
	}
	
	// Account Creation Success: redirect the user to the login page
	window.location.href = "login.html";
}

/**
 * Add a user to the database if there is not yet a user with the given
 * username or email. Displays an error message on failure, and returns whether
 * the user was successfully added.
 * TODO: change from local to server-side storage
 **/
function addUser(newUser) {
	// retrieve the users list from local storage and parse it into a js array
	let users = window.sessionStorage.getItem("users");
	if (users == null) {
		users = [];
	} else {
		users = JSON.parse(users);
	}
	// validate that the new user's username and email is unique
	for (otherUser of users) {
		if (otherUser.username == newUser.username) {
			displayMessage("That user already exists");
			return false;
		} else if (otherUser.email.toLowerCase() == newUser.email.toLowerCase()) {
			displayMessage("That email is already being used");
			return false;
		}
	}
	// add the new user and transform the users array back into JSON
	users.push(newUser);
	users = JSON.stringify(users);
	// update the session storage
	window.sessionStorage.setItem("users", users);
	return true;
}

/**
 * Display "message" to the HTML element with id "message".
 **/
function displayMessage(message) {
	let messageHTML = document.getElementById("message");
	messageHTML.textContent = message;
	messageHTML.append(document.createElement("br"));
	messageHTML.hidden = false;
}
