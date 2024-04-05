import UserAccount from './data/createUser.js';
import {dbConnection, closeConnection} from './mongoConfig/mongoConnection.js';
import * as pokeMongo from "./data/pokemonMongo.js"
import * as pokeAPI from "./data/pokemonAPI.js"
import express from 'express'
const app = express();
import configRoutes from './routes/index.js'


await dbConnection();
app.use(express.json())
configRoutes(app);
console.log('Connected to MongoDB');
app.listen(3000, () => {
    console.log("Server running on local host 3000");
})

//create account and search user 
try{
const userAccount = new UserAccount();

// Call the createUser method with the desired username and password
await userAccount.createUser("Lorre", "pass123");

// Search for users with a specific username
const searchResults = await userAccount.searchUsers("Lorre");
console.log(searchResults);

}
catch(error){
console.error('Error',error);
}
//add another user
try{
    const userAccount = new UserAccount();
    
    // Call the createUser method with the desired username and password
    await userAccount.createUser("Troy", "pass546");
    
    // Search for users with a specific username
    const searchResults = await userAccount.searchUsers("Troy");
    console.log(searchResults);
    
    }
    catch(error){
    console.error('Error',error);
    }
//send friend request

try{
    const userAccount = new UserAccount();

    await userAccount.sendFriendRequest("Troy","Lorre");

}

catch(error){
    console.error('Error',error);
}
//Accept friend request

try{
    const userAccount=new UserAccount();
    await userAccount.acceptFriendRequest("Troy","Lorre");
}
catch(error){
    console.error('Error',error);
}

/*
} finally {
    // Close database connection
    await closeConnection();
    console.log('Connection closed. Done!');
}
*/