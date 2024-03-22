import { userAccounts } from "../mongoConfig/mongoCollections.js";
//import {mongoConfig} from '../mongoConfig/settings.js';
import { getStartingCards, getAllInfoByID } from "./pokemonAPI.js"
//import {fetchCardsData} from "./data/pokemonAPI.js";
import validation from './validation.js'
import {ObjectId} from 'mongodb';


/**
    * createUser enter the user into the mongo userAccounts collection
    * It needs to be updated to accept input for the user for username and password
    * and it also needs to have checking to make sure username and password are correct
    * inputs and username is unique (very important for other getter methods)
    * @param {*} username needs to be unique string
    * @param {*} password must be string 
    */


export const createUser = async(username, password) => {
    try {
        let currDate = new Date().toISOString().slice(0, 10);
        let cardListObj = await getStartingCards();
        let friendListObj = [];
        let newUser = {
            userName: username,
            password: password,
            dateCreated: currDate,
            cardList: cardListObj,
            friendList: friendListObj
        }
                
        const userAccountsCollection = await userAccounts();
        const insertUser = await userAccountsCollection.insertOne(newUser)
        if (!insertUser.acknowledged || !insertUser.insertedId)
            throw "Could not add user";
    }
    catch (e) {
        console.log(e)
    }
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
    //console.log('get user by id in pokemon mongo')
    id = validation.checkId(id);
    //console.log('id cheched')
    const userCollection = await userAccounts();
    //console.log('user collection got')
    const user = await userCollection.findOne({_id: new ObjectId(id)});
    //console.log('user got')
    if (!user) throw 'Error: User not found';
    //console.log(user)
    return user;
};
export const getAllUsers = async() => {
    const userCollection = await userAccounts();
    const userList = await userCollection.find({}).toArray();
    return userList;
}