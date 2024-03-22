//import {dbConnection, closeConnection} from './mongoConfig/mongoConnection.js';
import {mongoConfig} from './mongoConfig/settings.js';
import { userAccounts } from "./mongoConfig/mongoCollections.js";
import { getStartingCards, getAllInfoByID } from "./data/pokemonAPI.js"
//wait dbConnection();

// PUT CREATE USER IN ./data/pokemonMongo.js NO LONGER NEED THIS FILE
/**
 * This is the userAccount class so it defines the schema of the userAccount Collection
 */
class UserAccount {
    constructor(client) {
        this.client = client
        this.url = mongoConfig.serverUrl;
        this.dbName = mongoConfig.database;
        this.createUser = this.createUser.bind(this);
    }
  
   /**
    * createUser enter the user into the mongo userAccounts collection
    * It needs to be updated to accept input for the user for username and password
    * and it also needs to have checking to make sure username and password are correct
    * inputs and username is unique (very important for other getter methods)
    * @param {*} username needs to be unique string
    * @param {*} password must be string 
    */
    async createUser(username, password) {
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
}


export default UserAccount
