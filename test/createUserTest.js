import { userAccount } from '../data/createUser.js';
import { findUsersByUsernameSubstring } from '../data/pokemonMongo.js';

export async function createUserTest(){
    //Scenario 1 - create users and friends 
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

        try {
            await userAccount.createUser("lorre15", "@Pass1234");
            console.log("User 'lorre15' created successfully.");
            await findUsersByUsernameSubstring("lorre14");
            console.log("User 'lorre15' retrieved successfully.");
        } catch (error) {
            console.log('Error creating or searching user Lorre: ' + error.message);
        }

        try {
            await userAccount.createUser("lorre16", "@Pass1234");
            console.log("User 'lorre16' created successfully.");
            await findUsersByUsernameSubstring("lorre14");
            console.log("User 'lorre16' retrieved successfully.");
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
    //   // Accept friend request from "Lorre" to "Troy"
        try {
            await userAccount.acceptFriendRequest("lorre14","troy14");
            console.log("friend added successfully");
        } catch (error) {
            console.log('Error accepting friend request: ' + error);
        }
        //create another user Larissa
        try {
            await userAccount.createUser("Larissa34", "@Pass1234");
            console.log("User 'Larissa' created successfully.");
            await findUsersByUsernameSubstring("Larissa");
            console.log("User 'Larissa' retrieved successfully.");
        } catch (error) {
            console.log('Error creating or searching user Larissa: ' + error.message);
        }

        //create another user Matt

        try {
            await userAccount.createUser("Matt12", "@Pass1234");
            console.log("User 'Matt' created successfully.");
            await findUsersByUsernameSubstring("Matt12");
            console.log("User 'Matt' retrieved successfully.");
        } catch (error) {
            console.log('Error creating or searching user Matt: ' + error.message);
        }

        //send friend request 

         // Send friend request from "Troy" to "Lorre"
         try {
            await userAccount.sendFriendRequest("Matt12", "Larissa34");
            console.log("Friend request sent successfully from 'Matt' to 'Larissa'.");
        } catch (error) {
            console.log('Error sending friend request: ' + error.message);
        }

        try {
            await userAccount.acceptFriendRequest("Larissa34","Matt12");
            console.log("friend added successfully");
        } catch (error) {
            console.log('Error accepting friend request: ' + error);
        }
        //create Ryan
        try {
            await userAccount.createUser("Ryan1", "FriendlyHuman1@");
            console.log("User 'Ryan1' created successfully.");
            await findUsersByUsernameSubstring("Ryan1");
            console.log("User 'Ryan1' retrieved successfully.");
        } catch (error) {
            console.log('Error creating or searching user Larissa: ' + error.message);
        }

        //create Guilherme

        try {
            await userAccount.createUser("Guilherme2", "FriendlyHuman1@");
            console.log("User 'Guilherme2' created successfully.");
            await findUsersByUsernameSubstring("Guilherme2");
            console.log("User 'Guilherme2' retrieved successfully.");
        } catch (error) {
            console.log('Error creating or searching user Larissa: ' + error.message);
        }

        //Send friend request
        try {
            await userAccount.sendFriendRequest("Guilherme2", "Ryan1");
            console.log("Friend request sent successfully from 'Guilherme2' to 'Ryan1'.");
        } catch (error) {
            console.log('Error sending friend request: ' + error.message);
        }

        try {
            await userAccount.acceptFriendRequest("Ryan1","Guilherme2");
            console.log("friend added successfully");
        } catch (error) {
            console.log('Error accepting friend request: ' + error);
        }
         //Scenario 2 : Reject friend Request 
          //create Marie
        // try {
        //     await userAccount.createUser("Marie56", "FriendlyHuman1@");
        //     console.log("User 'Marie56' created successfully.");
        //     await findUsersByUsernameSubstring("Ryan1");
        //     console.log("User 'Marie56' retrieved successfully.");
        // } catch (error) {
        //     console.log('Error creating or searching user Larissa: ' + error.message);
        // }

        // //create Jay

        // try {
        //     await userAccount.createUser("JayPatel2", "FriendlyClassmate1@");
        //     console.log("User 'JayPatel2' created successfully.");
        //     await findUsersByUsernameSubstring("Guilherme2");
        //     console.log("User 'JayPatel2' retrieved successfully.");
        // } catch (error) {
        //     console.log('Error creating or searching user Larissa: ' + error.message);
        // }

        // //Send friend request
        // try {
        //     await userAccount.sendFriendRequest("Marie56", "JayPatel2");
        //     console.log("Friend request sent successfully from 'Marie56' to 'JayPatel2'.");
        // } catch (error) {
        //     console.log('Error sending friend request: ' + error.message);
        // }
        //  //reject friend request
        //   try {
        //     await userAccount.rejectFriendRequest("JayPatel2","Marie56");
        //     console.log("Friend request rejected successfully.");
        // } catch (error) {
        //     if (error instanceof Error) {
        //         console.log('Error rejecting friend request: ' + error.message);
        //     } 
        // }

    }; 

