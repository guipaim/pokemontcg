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
        this.sendFriendRequest = this.sendFriendRequest.bind(this);
        this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
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
        let friendRequestsObj = []; // New field to store pending friend requests
        let newUser = {
            userName: username,
            password: password,
            dateCreated: currDate,
            cardList: cardListObj,
            friendList: friendListObj,
            friendRequests: friendRequestsObj // Add friendRequests field to the user schema
        }

        const userAccountsCollection = await userAccounts();
        const insertUser = await userAccountsCollection.insertOne(newUser)
        if (!insertUser.acknowledged || !insertUser.insertedId)
            throw "Could not add user";
    }
    catch (e) {
        console.log(e)
    }

    //search user from userAccounts collection
} async searchUsers(usernameQuery) {
    try {
        const userAccountsCollection = await userAccounts();
        const regex = new RegExp(usernameQuery, 'i'); // Case-insensitive search
        const users = await userAccountsCollection.find({ userName: regex }).toArray();
        return users;
    } catch (e) {
        console.log(e);
        return [];
    }
}

//send friend request 
async sendFriendRequest(senderUsername, receiverUsername) {
    try {
        const userAccountsCollection = await userAccounts();
        const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
        const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });

        if (!senderUser || !receiverUser) {
            throw "Sender or receiver user not found";
        }

        // Add the receiver's username to the sender's friendRequests
        senderUser.friendRequests.push(receiverUsername);

        // Save the updated sender user object
        await userAccountsCollection.updateOne({ userName: senderUsername }, { $set: { friendRequests: senderUser.friendRequests } });

        console.log(`${senderUsername} sent a friend request to ${receiverUsername}`);
    } catch (e) {
        console.log(e);
    }
}

//Adding accept friend request functionality 

async acceptFriendRequest(receiverUsername, senderUsername) {
    try {
        const userAccountsCollection = await userAccounts();
        const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });

        if (!receiverUser) {
            throw "Receiver user not found";
        }

        // Remove sender's username from receiver's friendRequests
        receiverUser.friendRequests = receiverUser.friendRequests.filter(request => request !== senderUsername);

        // Add sender's username to receiver's friendList
        receiverUser.friendList.push(senderUsername);

        // Save the updated receiver user object
        await userAccountsCollection.updateOne({ userName: receiverUsername }, { $set: { friendList: receiverUser.friendList, friendRequests: receiverUser.friendRequests } });

        console.log(`${receiverUsername} accepted friend request from ${senderUsername}`);
    } catch (e) {
        console.log(e);
    }
}

}


export default UserAccount
