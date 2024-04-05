import UserAccount from '../data/createUser.js';


(async () => {
    try {
        const userAccount = new UserAccount();

        // Create account and search user "Lorre"
        try {
            await userAccount.createUser("Lorre", "pass123");
            await userAccount.searchUsers("Lorre");
        } catch (error) {
            throw new Error('Error creating or searching user Lorre: ' + error);
        }

        // Add another user "Troy" and search user "Troy"
        try {
            await userAccount.createUser("Troy", "pass546");
            await userAccount.searchUsers("Troy");
        } catch (error) {
            throw new Error('Error creating or searching user Troy: ' + error);
        }

        // Send friend request from "Troy" to "Lorre"
        try {
            await userAccount.sendFriendRequest("Troy", "Lorre");
        } catch (error) {
            throw new Error('Error sending friend request: ' + error);
        }

        // Accept friend request from "Lorre" to "Troy"
        try {
            await userAccount.acceptFriendRequest("Lorre", "Troy");
        } catch (error) {
            throw new Error('Error accepting friend request: ' + error);
        }
    } catch (error) {
        throw new Error('General error: ' + error);
    }
})();
