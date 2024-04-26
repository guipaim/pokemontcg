import { userAccount } from '../data/createUser.js';
import { findUsersByUsernameSubstring } from '../data/pokemonMongo.js';

export async function createUserTest(){
    //     // Create account and search user "Lorre"
    //     console.log("try statement 1");
        try {
            await userAccount.createUser("lorre14", "@Pass1234");
            console.log("User 'lorre14' created successfully.");
            await findUsersByUsernameSubstring("lorre14");
            console.log("User 'lorre14' retrieved successfully.");
        } catch (error) {
            console.log('Error creating or searching user Lorre: ' + error.message);
        }

    //     // Add another user "Troy" and search user "Troy"
        try {
            await userAccount.createUser("troy14", "@Pass1234");
            console.log("User 'troy14' created successfully.");
            await findUsersByUsernameSubstring("troy14");
            console.log("User 'troy14' retrieved successfully.");
        } catch (error) {
            console.log('Error creating or searching user Troy: ' + error.message);
        }

    //     // Send friend request from "Troy" to "Lorre"
        try {
            await userAccount.sendFriendRequest("troy14", "lorre14");
            console.log("Friend request sent successfully from 'troy14' to 'lorre14'.");
        } catch (error) {
            console.log('Error sending friend request: ' + error.message);
        }
      // Accept friend request from "Lorre" to "Troy"
        try {
            await userAccount.acceptFriendRequest("lorre14","troy14");
            console.log("friend added successfully");
        } catch (error) {
            console.log('Error accepting friend request: ' + error);
        }

        // Reject friend request from "Lorre" to "Troy"
        // try {
        //     await userAccount.rejectFriendRequest("lorre14","troy14");
        //     console.log("Friend request rejected successfully.");
        // } catch (error) {
        //     if (error instanceof Error) {
        //         console.log('Error rejecting friend request: ' + error.message);
        //     } 
        // }
    }; 
   