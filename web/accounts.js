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
		displayMessage(failureMessage, "invalidEmailPassword");
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
	displayMessage(failureMessage, "invalidEmailPassword");
}

/**
 * Extract the new account's username, email, and password from the elements
 * with corresponding ids. Make sure that the email and username are unique,
 * and that the password matches the text in the element with id "password2".
 * If all this succeeds, log the user in, otherwise, display an error message.
 * TODO: (and duplicate server-side code)
 * TODO: email verification
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
	// Regular Expressions
	// Email: requires a series of letters and numbers before the @ symbol, the @ symbol, a series of letters and numbers for the domain name after @, a "." before the top-level domain, a top-level domain at least 2 characters long that can only be letters  
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	// Password: requires at least 1 upper and lower case letter, a number, a special character [!, @, $], and is at least 8 characters in length 
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@$])[A-Za-z\d!@$]{8,}$/;
	/** The choice of format below for user validation is so that multiple error messages 
	 * can be displayed at a time. Also, messages can update properly when a user updates a field and resubmits form
	 */
	if(!emailRegex.test(user.email)&&!passwordRegex.test(user.password)){// if both are invalid, we want to display both error messages at one time
		displayMessage("Email format is invalid.", "illegalEmail");
		displayMessage("Weak Password! It must be at least 8 characters long and contain 1 upper and lower case letter, a number, and a special character (!, @, $)", "illegalPassword");
		return;
	}else if(!emailRegex.test(user.email)){ // checks if only email is invalid
		document.getElementById("illegalPassword").hidden = true; // error message for user password should be hidden since it's valid
		displayMessage("Email format is invalid.", "illegalEmail");
		return;
	}else if(!passwordRegex.test(user.password)){ // checks if only password is invalid
		document.getElementById("illegalEmail").hidden = true; // error message for user email should be hidden since it's valid
		displayMessage("Weak Password! It must be at least 8 characters long and contain 1 upper and lower case letter, a number, and a special character (!, @, $)", "illegalPassword");
		return;
	}else{ // both are valid. Hide all error messages
		document.getElementById("illegalEmail").hidden = true;
		document.getElementById("illegalPassword").hidden = true;
	}

	// make sure passwords match
	if (user.password != user.password2) {
		displayMessage("Passwords do not match", "mismatchedPassword");
		return;
	}
	delete user.password2;
	// now that we've validated everything, we can attempt to add the user to the database
	if (!addUser(user)) {
		return; //username or email is a duplicate
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
	// validate that the new user's username (case sensitive) and email is unique (case insensitive)
	for (otherUser of users) { //Same logic applies here as in the reg exp tests. Want the error messages to update with user changes and resubmissions
		if(otherUser.username == newUser.username && otherUser.email.toLowerCase() == newUser.email.toLowerCase()){
			displayMessage("That username already exists", "illegalUsername");
			displayMessage("That email is already being used", "illegalEmail");
			return false;
		}
		if (otherUser.username == newUser.username) {
			document.getElementById("illegalEmail").hidden = true;
			displayMessage("That username already exists", "illegalUsername");
			return false;
		} else if (otherUser.email.toLowerCase() == newUser.email.toLowerCase()) {
			document.getElementById("illegalUsername").hidden = true;
			displayMessage("That email is already being used", "illegalEmail");
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
 * Display "message" to the HTML element corresponding to messageId.
 **/
function displayMessage(message, messageId) {
	let messageHTML = document.getElementById(messageId);
	messageHTML.textContent = message;
	messageHTML.append(document.createElement("br"));
	messageHTML.hidden = false;
}