import { userAccounts } from "../mongoConfig/mongoCollections.js";
// import { getStartingCards, getAllInfoByID } from "./pokemonAPI.js"
import validation from './validation.js'
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';


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

    if (!userName || !password) {
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

export const getUserById = async (id) => {
    id = validation.checkId(id);
    const userCollection = await userAccounts();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw 'Error: User not found';
    return user;
};

export const getAllUsers = async () => {
    const userCollection = await userAccounts();
    const userList = await userCollection.find({}).toArray();
    return userList;
}
