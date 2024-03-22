//import UserAccount from './createUser.js';
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