import { mongoConfig } from '../mongoConfig/settings.js';
import { userAccounts } from '../mongoConfig/mongoCollections.js';
import { getStartingCards, getHPInfoByID } from './pokemonAPI.js';
import exportedMethods from './validation.js';
import bcrypt from 'bcrypt';

export class UserAccount {
    constructor(client) {
        this.client = client;
        this.url = mongoConfig.serverUrl;
        this.dbName = mongoConfig.database;
        // this.createUser = this.createUser.bind(this);
        // this.sendFriendRequest = this.sendFriendRequest.bind(this);
        // this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
    }

    async createUser(username, password) {
        try {
            // Validate username and password
            username = exportedMethods.checkString(username, 'Username').toLowerCase().trim();
            password = exportedMethods.checkString(password, 'Password');
            const hashedPassword = await bcrypt.hash(password, 10);
            const currDate = new Date().toISOString().slice(0, 10);
            const cardListObj = await getStartingCards();
            let deckPoints = 0;
            for (let i in cardListObj) {
                let cardHP = await getHPInfoByID(cardListObj[i]);
                deckPoints += Number(cardHP);
            }
            const incomingTrades = [];
            const outGoingTrades = [];
            const friendListObj = [];
            const friendRequestsObj = []; // New field to store pending friend requests
            const outGoingFriendRequestsObj = [];
            const newUser = {
                userName: username,
                password: hashedPassword,
                dateCreated: currDate,
                cardList: cardListObj,
                friendList: friendListObj,
                friendRequests: friendRequestsObj,
                outGoingFriendRequests: outGoingFriendRequestsObj,
                incomingTrades: incomingTrades,
                outgoingTrades: outGoingTrades,
                lastCollectionGrowth: Date.now(),
                deckPoints: deckPoints
            };

            const userAccountsCollection = await userAccounts();
            const alreadyRegistered = await userAccountsCollection.findOne({ userName: username });

            let insertUser;

            if (alreadyRegistered) {
                throw new Error('You are already a registered user');
            }
            else {
                insertUser = await userAccountsCollection.insertOne(newUser);
                if (!insertUser.acknowledged || !insertUser.insertedId) {
                    throw new Error('Could not add user');
                }
            }
            return { insertedUser: true };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }

    async sendFriendRequest(senderUsername, receiverUsername) {
        try {
            // Validate sender and receiver usernames
            senderUsername = exportedMethods.checkString(senderUsername, 'Sender Username').toLowerCase().trim();
            receiverUsername = exportedMethods.checkString(receiverUsername, 'Receiver Username').toLowerCase().trim();
            const userAccountsCollection = await userAccounts();
            const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
            const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });

            if (senderUsername === receiverUsername) {
                throw new Error('You cannot send a friend request to yourself');
            }
            
            if (!senderUser || !receiverUser) {
                throw new Error('Sender or receiver user not found');
            }

            // Check if the sender has already sent a friend request to the receiver
            if (senderUser.outGoingFriendRequests.includes(receiverUsername)) {
                throw new Error('Friend request already sent');
            }

            if (senderUser.friendList.includes(receiverUsername)) {
                throw new Error(`You are already friends with ${receiverUsername}`);
            }

            // Check if the receiver has already received a friend request from the sender
            if (receiverUser.friendRequests.includes(senderUsername)) {
                throw new Error('Friend request already received');
            }

            // Add the receiver's username to the sender's outgoing requests
            senderUser.outGoingFriendRequests.push(receiverUsername);

            // Add the sender's username to the receiver's friendRequests
            receiverUser.friendRequests.push(senderUsername);

            // Save the updated user objects
            await userAccountsCollection.updateOne({ userName: senderUsername }, { $set: { outGoingFriendRequests: senderUser.outGoingFriendRequests } });
            await userAccountsCollection.updateOne({ userName: receiverUsername }, { $set: { friendRequests: receiverUser.friendRequests } });
        } catch (e) {
            throw new Error(e.message);
        }
    }
 //Accept friend request makes sure that the receiver(logged in user) gets a friend requets, and sender has that added to outgoing requests 
    async acceptFriendRequest(receiverUsername, senderUsername) {
        try {
            //Does validation for users and finds them in database
            receiverUsername = exportedMethods.checkString(receiverUsername, 'Receiver Username').toLowerCase().trim();
            senderUsername = exportedMethods.checkString(senderUsername, 'Sender Username').toLowerCase().trim();
            const userAccountsCollection = await userAccounts();
            const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });
            const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
            
            //throws error if sender or user are not found
            if (!receiverUser || !senderUser) {
                throw new Error('Receiver or sender user not found');
            }
            //the following  will keep checking if friend requets and outgoing friend requests exist or not 
            const senderIndex = receiverUser.friendRequests.indexOf(senderUsername);

            if (senderIndex !== -1) {
                receiverUser.friendRequests.splice(senderIndex, 1);
            }

            const receiverIndexInSender = senderUser.friendRequests.indexOf(receiverUsername);

            if (receiverIndexInSender !== -1) {
            senderUser.friendRequests.splice(receiverIndexInSender, 1);
            }

            const receiverIndexInSenderOutgoing = senderUser.outGoingFriendRequests.indexOf(receiverUsername);

            if (receiverIndexInSenderOutgoing !== -1) {
                senderUser.outGoingFriendRequests.splice(receiverIndexInSenderOutgoing, 1);
            }

            const senderIndexInReceiverOutgoing = receiverUser.outGoingFriendRequests.indexOf(senderUsername);

            if (senderIndexInReceiverOutgoing !== -1) {
            receiverUser.outGoingFriendRequests.splice(senderIndexInReceiverOutgoing, 1);
            }

              // Check if the sender has already sent a friend request to the receiver
            //   if (senderUser.outGoingFriendRequests.includes(receiverUsername)) {
            //     throw new Error('Friend request already sent');
            // }

            if (senderUser.friendList.includes(receiverUsername)) {
                throw new Error(`You are already friends with ${receiverUsername}`);
            }

            // Check if the receiver has already received a friend request from the sender
            if (receiverUser.friendRequests.includes(senderUsername)) {
                throw new Error('Friend request already received');
            }
            //Push sender and user to each other's friend lists after friend request is accepted 
            receiverUser.friendList.push(senderUsername);
            senderUser.friendList.push(receiverUsername);



                // Save the updated user objects
                await userAccountsCollection.updateOne(
                    { userName: receiverUsername },
                    { $set: { 
                        friendList: receiverUser.friendList, 
                        friendRequests: receiverUser.friendRequests,
                        outGoingFriendRequests: receiverUser.outGoingFriendRequests
                    } }
                );
                await userAccountsCollection.updateOne(
                    { userName: senderUsername },
                    { $set: { 
                        friendList: senderUser.friendList, 
                        friendRequests: senderUser.friendRequests,
                        outGoingFriendRequests: senderUser.outGoingFriendRequests
                     } }
                );
            } catch (e) {
                throw new Error(e.message);
            }
    }
    

    async rejectFriendRequest(receiverUsername, senderUsername) {
        try {
            // Validate receiver and sender usernames
            receiverUsername = exportedMethods.checkString(receiverUsername, 'Receiver Username').toLowerCase().trim();
            senderUsername = exportedMethods.checkString(senderUsername, 'Sender Username').toLowerCase().trim();
    
            const userAccountsCollection = await userAccounts();
            const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });
            const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
    
            if (!receiverUser) {
                throw new Error('Receiver user not found');
            }
    
            //the following will keep checking if friend requets and outgoing friend requests exist or not 
            const index = receiverUser.friendRequests.indexOf(senderUsername);
    
            if (index !== -1) {
        
                receiverUser.friendRequests.splice(index, 1);
            
                const senderIndex = senderUser.outGoingFriendRequests.indexOf(receiverUsername);
                if (senderIndex !== -1) {
                    senderUser.outGoingFriendRequests.splice(senderIndex, 1);
                }
                          
                // Update both user objects in the database
                await userAccountsCollection.updateOne(
                    { userName: receiverUsername },
                    { $set: { friendRequests: receiverUser.friendRequests } }
                );
                await userAccountsCollection.updateOne(
                    { userName: senderUsername },
                    { $set: { outGoingFriendRequests: senderUser.outGoingFriendRequests } }
                );
            } else {
                console.log('Friend request not found');
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }
    
    async getAllFriends(senderUsername){
        senderUsername = exportedMethods.checkString(senderUsername, 'Sender Username').toLowerCase().trim();
        // receiverUsername = exportedMethods.checkString(receiverUsername, 'Receiver Username').toLowerCase().trim();

        const userAccountsCollection = await userAccounts();

        let senderUser;

        try {
            senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
        } catch (e) {
            return new Error("You are not logged in");
        }
        // const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });
        if(!senderUser ){
            throw new Error("You are not logged in");
        }

        const senderFriendList=senderUser.friendList
     
       return senderFriendList;

    }
    catch (e) {
        throw new Error(e.message);
    }

    }

export default UserAccount;

export const userAccount = new UserAccount(null);
