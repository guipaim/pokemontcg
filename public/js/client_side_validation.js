// In this file, you must perform all client-side validation for every single form input (and the role dropdown) on your pages. 
// The constraints for those fields are the same as they are for the data functions and routes. Using client-side JS, you will 
// intercept the form's submit event when the form is submitted and If there is an error in the user's input or they are missing 
// fields, you will not allow the form to submit to the server and will display an error on the page to the user informing them of 
// what was incorrect or missing.  You must do this for ALL fields for the register form as well as the login form. If the form 
// being submitted has all valid data, then you will allow it to submit to the server for processing. Don't forget to check that 
// password and confirm password match on the registration form!

function validateEmailAddress(email) {

  console.log('Validating Email Address');

  if (email.trim() === '') {
    console.log('Email empty')
      return "Email address cannot be empty.\n";
  }


  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    console.log('Email invalid')
      return "Please enter a valid email address.\n";
  }

  return "";
}
  
function validatePassword(password) {
  console.log('Validating password')
  if (!password) {
    console.log('password empty');
      return "Password cannot be empty.\n";
  }


  if (password.length < 8) {
    console.log('PW less than 8 ');
      return "Password must be at least 8 characters long.\n";
  }


  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).*$/;
  if (!regex.test(password)) {
    console.log('PW not complex ');
      return "Password must contain at least one uppercase letter, one number, and one special character.\n";
  }

  return ""; 
}

function validateRegistrationForm(event) {
  console.log('Validating Registration Form');

  event.preventDefault();

  const registrationForm = document.getElementById('registration-form');
  console.log('Validating Registration Form Step 1');

  let errorMessages = [];
  console.log('Validating Registration Form Step 2');

  const errorsList = document.createElement('ul');
  console.log('Validating Registration Form Step 3');

  const errorElement = document.getElementById('error');
  console.log('Validating Registration Form Step 4');

  errorElement.style.display = 'none';
  console.log('Validating Registration Form Step 5');

  let userName = document.getElementById('userNameInput').value;
  let pwd = document.getElementById('passwordInput').value;
  let cnfmPwd = document.getElementById('confirmPasswordInput').value;
  console.log('Validating Registration Form Step 6');

  if (userName.trim() === '') {
    console.log('Validating Registration Form Step 7');
    errorMessages.push("User Name cannot be empty.\n");
  }


  if (!/^[A-Za-z'-]+$/.test(userName)) {
    console.log('Validating Registration Form Step 8');
    errorMessages.push("User Name contains invalid characters.\n");
  }


  if (userName.length < 2 || userName.length > 25) {
    console.log('Validating Registration Form Step 9');
    errorMessages.push("User Name must be between 2 and 25 characters long.\n");
  }

  const passwordError = validatePassword(pwd);
  console.log('Validating Registration Form Step 15');

  if (pwd !== cnfmPwd) {
    console.log('Validating Registration Form Step 16');
    errorMessages.push('Passwords do not match\n')
  }
  if (passwordError) {
    console.log('Validating Registration Form Step 17');
    errorMessages.push(passwordError);

  }

  if (errorMessages.length > 0) {
    console.log('Validating Registration Form Step 21');
    errorMessages.forEach((errorMessage) => {
      const listItem = document.createElement('li');
      listItem.textContent = errorMessage;
      errorsList.appendChild(listItem);
    });
    console.log('Validating Registration Form Step 22');
    errorElement.appendChild(errorsList);
    console.log('Validating Registration Form Step 23');

    errorElement.style.display = 'block';
    console.log('Validating Registration Form Step 24');
  } else {
    console.log('Validating Registration Form Step 25');
    registrationForm.submit();
  }

};

function validateLoginForm(event) {

  event.preventDefault();

  const loginForm = document.getElementById('login-form');

  let errorMessages = [];
  const errorsList = document.createElement('ul');

  const errorElement = document.getElementById('error');

  errorElement.style.display = 'none';

  let email = document.getElementById('emailAddressInput').value;
  let pwd = document.getElementById('passwordInput').value;

  const emailError = validateEmailAddress(email);

  email = email.toLowerCase().trim();

  if (emailError) {
    errorMessages.push(emailError);
    //return;
  }

  const passwordError = validatePassword(pwd);

  if (passwordError) {
    errorMessages.push(passwordError);
    //return;
  }

  if (errorMessages.length > 0) {
    errorMessages.forEach((errorMessage) => {
      const listItem = document.createElement('li');
      listItem.textContent = errorMessage;
      errorsList.appendChild(listItem);
    });
    errorElement.appendChild(errorsList);
    //errorElement.textContent = errorMessages.join('\n ');
    errorElement.style.display = 'block';
  } else {
    // If all validations pass, submit the form or do something else
    loginForm.submit(); // Or AJAX request, etc.
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const registrationForm = document.getElementById('registration-form');
  const loginForm = document.getElementById('login-form');
    
  if (registrationForm) {
    registrationForm.addEventListener('submit', validateRegistrationForm);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', validateLoginForm);
  }
});

