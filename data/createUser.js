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
                friendRequests: friendRequestsObj, // Add friendRequests field to the user schema
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
            const userAccountsCollection = await userAccounts();
            const senderUser = await userAccountsCollection.findOne({ userName: senderUsername });
            const receiverUser = await userAccountsCollection.findOne({ userName: receiverUsername });

            if (!senderUser || !receiverUser) {
                throw new Error('Sender or receiver user not found');
            }

            // Add the receiver's username to the sender's friendRequests
            senderUser.friendRequests.push(receiverUsername);

            // Save the updated sender user object
            await userAccountsCollection.updateOne({ userName: senderUsername }, { $set: { friendRequests: senderUser.friendRequests } });
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

            // Remove sender's username from receiver's friendRequests
            receiverUser.friendRequests = receiverUser.friendRequests.filter(request => request !== senderUsername);

            // Add sender's username to receiver's friendList
            receiverUser.friendList.push(senderUsername);

            // Remove receiver's username from sender's friendRequests
            senderUser.friendRequests = senderUser.friendRequests.filter(request => request !== receiverUsername);

            // Add receiver's username to sender's friendList
            senderUser.friendList.push(receiverUsername);

            // Save the updated user objects
            await userAccountsCollection.updateOne(
                { userName: receiverUsername },
                { $set: { friendList: receiverUser.friendList, friendRequests: receiverUser.friendRequests } }
            );
            await userAccountsCollection.updateOne(
                { userName: senderUsername },
                { $set: { friendList: senderUser.friendList, friendRequests: senderUser.friendRequests } }
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

            if (!receiverUser) {
                throw new Error('Receiver user not found');
            }

            // Find the index of sender's username in receiver's friendRequests array
            const index = receiverUser.friendRequests.indexOf(senderUsername);

            if (index !== -1) {
                // Remove sender's username from receiver's friendRequests array
                receiverUser.friendRequests.splice(index, 1);

                // Update the receiver user object in the database
                await userAccountsCollection.updateOne(
                    { userName: receiverUsername },
                    { $set: { friendRequests: receiverUser.friendRequests } }
                );
            } else {
                console.log('Friend request not found');
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }

}
export default UserAccount;

export const userAccount = new UserAccount(null);
