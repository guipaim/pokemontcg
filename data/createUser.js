import { mongoConfig } from '../mongoConfig/settings.js';
import { userAccounts } from '../mongoConfig/mongoCollections.js';
import { getStartingCards } from './pokemonAPI.js';
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
            const friendListObj = [];
            const friendRequestsObj = []; // New field to store pending friend requests

            const newUser = {
                userName: username,
                password: hashedPassword,
                dateCreated: currDate,
                cardList: cardListObj,
                friendList: friendListObj,
                friendRequests: friendRequestsObj,
                lastCollectionGrowth: Date.now()
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

            if (senderUsername === receiverUsername) {
                throw new Error('Sender and receiver usernames cannot be the same');
            }
            const userAccountsCollection = await userAccounts();
            const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
            const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });

            if (!senderUser || !receiverUser) {
                throw new Error('Sender or receiver user not found');
            }
            if (senderUser.friendList.includes(receiverUsername) || receiverUser.friendList.includes(senderUsername)) {
                throw new Error('Users are already friends');
            }
            //Checking so that multiple friend requests are not sent 
            if (senderUser.friendRequests.includes(receiverUsername)) {
                throw new Error('Friend request already sent');
            }
            if (receiverUser.friendRequests.includes(senderUsername)) {
                throw new Error('Friend request already received');
            }
            
            //pushing friend request to both sender and receiver so that we can cross check and there are not duplicates on both sides

            senderUser.friendRequests.push(receiverUsername);
            receiverUser.friendRequests.push(senderUsername);

            // await userAccountsCollection.updateOne({ userName: senderUsername }, { $set: { friendRequests: senderUser.friendRequests } });
            await userAccountsCollection.updateOne({ userName: receiverUsername }, { $set: { friendRequests: receiverUser.friendRequests } });

        } catch (e) {
            throw new Error(e.message);
        }
    }

    async acceptFriendRequest(receiverUsername, senderUsername) {
        try {
            receiverUsername = exportedMethods.checkString(receiverUsername, 'Receiver Username').toLowerCase().trim();
            senderUsername = exportedMethods.checkString(senderUsername, 'Sender Username').toLowerCase().trim();

            const userAccountsCollection = await userAccounts();
            const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });
            const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });

            if (!receiverUser || !senderUser) {
                throw new Error('Receiver or sender user not found');
            }
            const senderIndex = receiverUser.friendRequests.indexOf(senderUsername);
            if (senderIndex !== -1) {

                receiverUser.friendRequests.splice(senderIndex, 1);
                receiverUser.friendList.push(senderUsername);
                senderUser.friendRequests = senderUser.friendRequests.filter(request => request !== receiverUsername);
                senderUser.friendList.push(receiverUsername);

                await userAccountsCollection.updateOne(
                    { userName: receiverUsername },
                    { $set: { friendList: receiverUser.friendList, friendRequests: receiverUser.friendRequests } }
                );
        
                await userAccountsCollection.updateOne(
                    { userName: senderUsername },
                    { $set: { friendList: senderUser.friendList, friendRequests: senderUser.friendRequests } }
                );
            } else {
                throw new Error('Sender username not found in receiver\'s friend requests');
            }
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

            if (!receiverUser) {
                throw new Error('Receiver user not found');
            }

            const index = receiverUser.friendRequests.indexOf(senderUsername);
            if (index !== -1) {
                // Remove sender's username from receiver's friendRequests array
                receiverUser.friendRequests.splice(index, 1);
                await userAccountsCollection.updateOne(
                    { userName: receiverUsername },
                    { $set: { friendRequests: receiverUser.friendRequests } }
                );
            } else {
                throw new Error('Friend request not found');
            }

        } catch (e) {
            throw new Error(e.message);
        }
    }
    async getAllFriends(senderUsername){
        senderUsername = exportedMethods.checkString(senderUsername, 'Sender Username').toLowerCase().trim();
        // receiverUsername = exportedMethods.checkString(receiverUsername, 'Receiver Username').toLowerCase().trim();

        const userAccountsCollection = await userAccounts();
        const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
        // const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });
        if(!senderUser ){
            throw new Error("user not found")
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

