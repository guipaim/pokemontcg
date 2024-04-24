import {ObjectId} from 'mongodb';

const exportedMethods = {
  checkId(id) {
    if (!id) throw 'Error: You must provide an id to search for';
    if (typeof id !== 'string') throw 'Error: id must be a string';
    id = id.trim();
    if (id.length === 0)
      throw 'Error: id cannot be an empty string or just spaces';
    if (!ObjectId.isValid(id)) throw 'Error: invalid object ID';
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkEmailAddress (addyToCheck) {
    const email = addyToCheck.toLowerCase().trim();
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
        return 'Please provide a valid email address!';
    }
    return true;
  },

  checkPassword (pwToCheck) {

    if (pwToCheck.includes(' ')) {
        return 'Password must not contain spaces.';
    }
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
   
    if (!regex.test(pwToCheck)) {
        return 'Password does not meet complexity requirements.';
    }

    return true;
},
 validateSelection() {
  var dropdown = document.getElementById("variable-dropdown");
  var selectedUserName = dropdown.value; // Get the selected user name
  if (!selectedUserName || selectedUserName === "") {
      alert("Please choose a user from the dropdown menu.");
      return false; // Validation failed
  }
  return true; // Validation passed
}
};

export default exportedMethods;