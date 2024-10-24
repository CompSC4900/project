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
			window.location.href = "/home/";
			return;
		}
	}
	// we did not find a matching user
	displayMessage(failureMessage, "invalidEmailPassword");
}

/**
 * Extract the new account's name (first and last), address (street, city, state, zip), date of birth, gender
 * phone number, email, and password from form using input tag IDs. The first external function call is to regExp(), which 
 * validates user input. The second, addUser(), adds the user to session storage if input passes all validation tests
 * Once the user is successfully added, the user will be redirected to the login page to sign in.
 * TODO: (and duplicate server-side code)
 * TODO: email verification
 **/
function createAccount() {
	// stuff we need to pull from the HTML
	let requirements = ["fname","lname","address","city", "state", "zip","DoB", "phoneNum", "email", "password", "password2"];
	// "user" object with "requirements" as keys
	let user = {};
	// get the requirements
	requirements.forEach(requirement => {
			let requirementHTML = document.getElementById(requirement);
			user[requirement] = requirementHTML.value;
	});
	//Gender is handled differently
	let gender = document.querySelector('input[name="gender"]:checked');
	user['gender'] = gender ? gender.value : null; //Get the value of selected gender radio button, or null if not selected
	
	if(!regExp(user)){
		return; //input failed tests
	}else{ //input passed all tests
		delete user.password2;
		//add user to session storage
		addUser(user);
		// Account Creation Success: redirect the user to the login page
		window.location.href = "/login/";
	}
}

/**
 * This is the user validation function. All fields in the form
 * have some type of format requirement, and some may have more than one type of validation test performed. 
 */
function regExp(user){
	let valid = true;

	//First Name, Last Name, and Address: Cannot exceed 50 characters
	const characterLimit50 = /^.{0,50}$/;
	if(!characterLimit50.test(user.fname)){
		displayMessage(null, "illegalFName");
		valid = false;
	}else{
		document.getElementById("illegalFName").style.display = 'none';
	}
	if(!characterLimit50.test(user.lname)){
		displayMessage(null, "illegalLName");
		valid = false;
	}else{
		document.getElementById("illegalLName").style.display = 'none';
	}
	if(!characterLimit50.test(user.address)){
		displayMessage(null, "illegalAddress");
		valid = false;
	}else{
		document.getElementById("illegalAddress").style.display = 'none';
	}
	//City: Cannot exceed 20 characters
	const characterLimit20 = /^.{0,20}$/;
	if(!characterLimit20.test(user.city)){
		displayMessage(null, "illegalCity");
		valid = false;
	}else{
		document.getElementById("illegalCity").style.display = 'none';
	}
	//State: must select a state
	if (user.state === "") {
        displayMessage(null, "illegalState");
        valid = false;
    } else {
        document.getElementById("illegalState").style.display = 'none';
    }
	//Zip: a 5-digit number
	const zipRegex = /^\d{5}$/;
	if(!zipRegex.test(user.zip)){
		displayMessage(null, "illegalZip");
		valid = false;
	}else{
		document.getElementById("illegalZip").style.display = 'none';
	}
	//Date of Birth: between the year 1900 and current year (no min age requirement right now)
	const dob = new Date(user.DoB);
	const year = dob.getFullYear();
	const currentYear = new Date().getFullYear();
	if(year < 1900 || year > currentYear){
		displayMessage(null, "illegalDoB");
		valid = false;
	}else{
		document.getElementById("illegalDoB").style.display = 'none';
	}
	//Gender: must select one of the options
	if(user.gender == null){
		displayMessage(null, "illegalGender");
		valid = false;
	}else{
		document.getElementById("illegalGender").style.display = 'none';
	}
	//Phone Number: must be in (xxx) xxx-xxxx
	const phoneNumRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
	if(!phoneNumRegex.test(user.phoneNum)){
		displayMessage(null, "illegalPhoneNum");
		valid = false;
	}else{
		document.getElementById("illegalPhoneNum").style.display = 'none';
	}
	// Email: requires a series of letters and/or numbers before the @ symbol, the @ symbol, a series of letters and/or numbers for the domain name after @, a "." before the top-level domain, a top-level domain at least 2 letters long (no numbers/special characters)
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if(!emailRegex.test(user.email)){
		displayMessage("*Invalid email", "illegalEmail");
		valid = false;
	}else{
		// retrieve the users list from local storage and parse it into a js array
		let currentUsers = window.sessionStorage.getItem("users");
		if (currentUsers == null) {
			currentUsers = [];
		} else {
			currentUsers = JSON.parse(currentUsers);
		}
		//checks if there is any duplicate emails
		let found = false;
		for(otherUser of currentUsers){
			if(otherUser.email.toLowerCase() == user.email.toLowerCase()){
				displayMessage("*This email is already being used", "illegalEmail");
				valid = false;    
				found = true;
				break;
			}
		}
		if(!found){
			document.getElementById("illegalEmail").style.display = 'none';
		}
	}
	// Password: requires at least 1 upper and lower case letter, a number, a special character [!, @, $], and is at least 8 characters in length 
	const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@$])[A-Za-z\d!@$]{8,}$/;
	if(!passwordRegex.test(user.password)){
		displayMessage(null, "illegalPassword");
		valid = false;
	}else{
		document.getElementById("illegalPassword").style.display = 'none';
	}
	//checks if the retyped password matches
	if(user.password != user.password2){
		displayMessage(null, "mismatchedPassword");
		valid = false;
	}else{
		document.getElementById("mismatchedPassword").style.display = 'none';
	}

	return valid;
}

/**
 * Add a user to the database
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
	
	// add the new user and transform the users array back into JSON
	users.push(newUser);
	users = JSON.stringify(users);
	// update the session storage
	window.sessionStorage.setItem("users", users);
}

/**
 * Display "message" to the HTML element corresponding to messageId.
 **/
function displayMessage(message, messageId) {
	let messageHTML = document.getElementById(messageId);
	if(message != null){
		messageHTML.textContent = message;
	}
	messageHTML.style.display = 'inline';
}
