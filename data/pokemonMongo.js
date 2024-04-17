import { userAccounts } from "../mongoConfig/mongoCollections.js";
//import {mongoConfig} from '../mongoConfig/settings.js';
import { getStartingCards, getAllInfoByID } from "./pokemonAPI.js"
//import {fetchCardsData} from "./data/pokemonAPI.js";
import validation from './validation.js'
import {ObjectId} from 'mongodb';
import bcrypt from 'bcrypt';


/**
    * createUser enter the user into the mongo userAccounts collection
    * It needs to be updated to accept input for the user for username and password
    * and it also needs to have checking to make sure username and password are correct
    * inputs and username is unique (very important for other getter methods)
    * @param {*} username needs to be unique string
    * @param {*} password must be string 
    */


export const createUser = async(username, password) => {
    {

        const hashedPassword = await bcrypt.hash(password, 10);
        
        let currDate = new Date().toISOString().slice(0, 10);
        let cardListObj = await getStartingCards();
        let friendListObj = [];
        let newUser = {
            userName: username,
            password: hashedPassword,
            dateCreated: currDate,
            cardList: cardListObj,
            friendList: friendListObj
        }

        const userAccountsCollection = await userAccounts();

        const alreadyRegistered = await userAccountsCollection.findOne({ userName: username });

        let insertUser;

        if(alreadyRegistered) {
            throw new Error('You are already a registered user');
        }
        else {
            insertUser = await userAccountsCollection.insertOne(newUser);
            if (!insertUser.acknowledged || !insertUser.insertedId) {
                throw new Error('Could not add user');
            }
        }
        return {insertedUser: true};
    }
    /*catch (e) {
        console.log(e)
    }*/

    

    }



/**
 * 
 * @param {*} username username of the user
 * @returns all info in mongo on that user
 */
export const getUserByUsername = async (username) => {
    try {
        const userAccountsCollection = await userAccounts();
        const user = await userAccountsCollection.findOne({ userName: username });
        return user;
    } catch (error) {
        console.error('Error getting user by username:', error);
        throw error;
    }
};

export const loginUser = async (userName, password) => {

    let username;
    let userNameCheckResult;
    let passwordCheckResult;
    const userAccountsCollection = await userAccounts();

    if (!userName ||!password) {
      throw new Error('Must supply a User Name and a Password');
    }
    else {
      userNameCheckResult = validation.checkString(userName, username);
      passwordCheckResult = validation.checkPassword(password);
    }
  
    if (userNameCheckResult) {
      username = userName.toLowerCase().trim();
    }
    else {
      throw new Error('Invalid User Name.');
    }
  
    if (!passwordCheckResult) {
      throw new Error('Password is invalid.');
    }
    const user = await userAccountsCollection.findOne({ userName: userName });
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return {
        userName: user.userName
      };
    }
    else {
      throw new Error('User Name or Password is invalid');
    }
  };

/**
 * 
 * @param {*} username username of the user
 * @returns the cardlist of that user
 */
export const getCardListByUsername = async (username) => {
    try {
        const user = await getUserByUsername(username);
        if (user) {
            return user.cardList;
        } else {
            return null; // User not found
        }
    } catch (error) {
        console.error('Error getting card list by username:', error);
        throw error;
    }
};

export const  getUserById = async(id) =>{
    id = validation.checkId(id);
    const userCollection = await userAccounts();
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    if (!user) throw 'Error: User not found';
    return user;
};
export const getAllUsers = async() => {
    const userCollection = await userAccounts();
    const userList = await userCollection.find({}).toArray();
    return userList;
}