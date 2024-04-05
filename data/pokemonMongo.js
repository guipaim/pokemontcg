import { userAccounts } from "../mongoConfig/mongoCollections.js";
//import {mongoConfig} from '../mongoConfig/settings.js';
import { getStartingCards, getAllInfoByID } from "./pokemonAPI.js"
//import {fetchCardsData} from "./data/pokemonAPI.js";
import validation from './validation.js'
import {ObjectId} from 'mongodb';

//This file gets the cardList,gets user by ID and allows to search for all users
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