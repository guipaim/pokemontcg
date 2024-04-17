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


/*
try {
    const client = await dbConnection();
    console.log('Connected to MongoDB');
    
    // Create UserAccount instance
    //const user = new UserAccount(client);

    // Example usage
    
    const username = 'john_doe';
    const password = 'password123';
    await pokeMongo.createUser(username, password);
    console.log('User created successfully');
    let uid = await pokeMongo.getUserByUsername('john_doe')
    console.log(uid)
    console.log(uid.userName)
    let cl = await pokeMongo.getCardListByUsername(uid.userName)
    console.log(cl)
    let im = await pokeAPI.getImageUrlByCardId(uid.cardList[0])
    console.log(im)
    
   
    app.use(express.json())
    configRoutes(app);

    app.listen(3000, () => {
        console.log("Server running on local host 3000");
    })

} catch (error) {
    console.error('Error:', error);
} finally {
    // Close database connection
    await closeConnection();
    console.log('Connection closed. Done!');
}
*/