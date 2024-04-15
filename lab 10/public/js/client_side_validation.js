// In this file, you must perform all client-side validation for 
//every single form input (and the role dropdown) on your pages. 
//The constraints for those fields are the same as they are for the data 
//functions and routes. Using client-side JS, you will intercept the form's 
//submit event when the form is submitted and If there is an error in the user's 
//input or they are missing fields, you will not allow the form to submit to the 
//server and will display an error on the page to the user informing them of what was 
//incorrect or missing.  You must do this for ALL fields for the register form as well as 
//the login form. If the form being submitted has all valid data, then you will allow it to s
//ubmit to the server for processing. Don't forget to check that password and confirm 
//password match on the registration form!

function registerHandler(event) {
    event.preventDefault();
    const registerForm = document.getElementById("registration-form");
    const firstNameField = document.getElementById("firstNameInput");
    const lastNameField = document.getElementById("lastNameInput");
    const emailField = document.getElementById("emailAddressInput");
    const passwordField = document.getElementById("passwordInput");
    const confirmPasswordField = document.getElementById("confirmPasswordInput");
    const roleField = document.getElementById("roleInput");
    const errorMsg = document.getElementById("errorMsg");

    //console.log(firstNameField)
    //console.log(firstNameField.value)
    if(typeof firstNameField.value !== 'string' || firstNameField.value.trim() === '') {
        errorMsg.textContent = ' first Name must be non empty string';
        return;
    }
    if(/\d/.test(firstNameField.value)) {
        errorMsg.textContent ='First Name cannot contain numbers';
        return;
    }
    if(firstNameField.value.length < 2 || firstNameField.value.length > 25) {
        errorMsg.textContent ='First Name must be between 2 and 25 chars';
        return;
    }
    if(typeof lastNameField.value !== 'string' || lastNameField.value.trim() === '') {
        errorMsg.textContent ='Last Name must be non empty string';
        return;
    }
    if(/\d/.test(lastNameField.value)) {
        errorMsg.textContent ='Last Name cannot contain numbers';
        return;
    }
    if(lastNameField.value.length < 2 || lastNameField.value.length > 25) {
        errorMsg.textContent ='Last Name must be between 2 and 25 chars';
        return;
    }
    //console.log(emailField.value)
    if (typeof emailField.value !== 'string' || emailField.value.trim() === '') {
        errorMsg.textContent ='Email must be a non-empty string.';
        return;
    }
    const split = emailField.value.split('@');
    //console.log(split)
    if(split.length !== 2) {
        errorMsg.textContent = 'invalid email';
        return;
    }
    else {
        const [a,b] = split;
        if(a.trim() === '' || b.trim() === '' || b.length < 5) {
            errorMsg.textContent ='invalid email';
            return;
        }
        if(!b.endsWith('.com')) {
            errorMsg.textContent ='invalid email';
            return;
        }
    }
    if(typeof passwordField.value !== 'string' || passwordField.value.trim() === '' || passwordField.value.length < 8) {
        errorMsg.textContent = 'Password invalid';
        return;
    }
    if (!/[A-Z]/.test(passwordField.value)) {
        errorMsg.textContent = 'password must have 1 uppercase';
        return;
    }
    if(!/\d/.test(passwordField.value)) {
        errorMsg.textContent = 'password must have 1 number';
        return;
    }
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?\/\\~-]/.test(passwordField.value)) {
        errorMsg.textContent = 'password must contain one special char';
        return;
    }
    if(passwordField.value !== confirmPasswordField.value) {
        errorMsg.textContent ='Passwords must match';
        return;
    }
    if(roleField.value !== 'admin' && roleField.value !== 'user') {
        errorMsg.textContent = 'role must be admin or user';
        return;
    }
    registerForm.submit();
  }
  
  function loginHandler(event) {
    event.preventDefault();
    const loginForm = document.getElementById("login-form");
    const emailField = document.getElementById("emailAddressInput");
    const passwordField = document.getElementById("passwordInput");
    const errorMsg = document.getElementById("errorMsg");
    
    if (typeof emailField.value !== 'string' || emailField.value.trim() === '') {
        errorMsg.textContent ='email or password invalid';
        return;
    }
    const split = emailField.value.split('@');
    if(split.length !== 2) {
        errorMsg.textContent ='email or password invalid';
        return;
    }
    const [a,b] = split;
    if(a.trim() === '' || b.trim() === '' || b.length < 5) {
        errorMsg.textContent ='email or password invalid';
        return;
    }
    if(!b.endsWith('.com')) {
        errorMsg.textContent ='email or password invalid';
        return;
    }
    if(typeof passwordField.value !== 'string' || passwordField.value.trim() === '' || passwordField.value.length < 8) {
        errorMsg.textContent = 'email or password invalid';
        return;
    }
    if (!/[A-Z]/.test(passwordField.value)) {
        errorMsg.textContent = 'email or password invalid';
        return;
    }
    if(!/\d/.test(passwordField.value)) {
        errorMsg.textContent = 'email or password invalid';
        return;
    }
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?\/\\~-]/.test(passwordField.value)) {
        errorMsg.textContent = 'email or password invalid';
        return;
    }

    loginForm.submit();
  }
