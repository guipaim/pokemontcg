//import mongo collections, bcrypt and implement the following data functions
import helper from '../helpers.js'
import { users } from "../config/mongoCollections.js";
import bcrypt from 'bcrypt';

export const registerUser = async (
  firstName,
  lastName,
  emailAddress,
  password,
  role
) => {
  if (registerUser.length !== 5 || firstName === undefined || lastName === undefined || 
    emailAddress === undefined || password === undefined || role === undefined) {
      throw 'All 5 arguments must be supplied'
    }
  firstName = helper.checkName(firstName);
  lastName = helper.checkName(lastName);
  emailAddress = helper.checkEmail(emailAddress);
  const usersCollection = await users();

  let emailInUse = await usersCollection.findOne( { emailAddress: emailAddress });
  if(emailInUse) {
    throw 'Email already in use';
  }
  password = helper.checkPassword(password);
  role = helper.checkRole(role);
  const saltRounds = 16;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  let newUser = {
    firstName: firstName,
    lastName: lastName,
    emailAddress: emailAddress,
    password: passwordHash,
    role: role
  }
  
  const insertUser = await usersCollection.insertOne(newUser);

  if(!insertUser.acknowledged) {
    throw 'Could not insert new user';
  }
  return ({insertedUser: true}); 
};

export const loginUser = async (emailAddress, password) => {
  if (loginUser.length !== 2 || emailAddress === undefined || password === undefined) {
      throw 'email and password not supplied';
    }
  emailAddress = helper.checkEmail(emailAddress);
  password = helper.checkPassword(password);
  
  const usersCollection = await users();
  const user = await usersCollection.findOne({emailAddress: emailAddress});
 
  if(!user) {
    throw 'email or password incorrect';
  }
  const passwordCheck = await bcrypt.compare(password, user.password);
  if(!passwordCheck) {
    throw 'email or password incorrect';
  }

  const userData = {
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    role: user.role
  };
  return userData;
};
