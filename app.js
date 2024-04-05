// import UserAccount from './data/createUser.js';
import {dbConnection, closeConnection} from './mongoConfig/mongoConnection.js';
// import * as pokeMongo from "./data/pokemonMongo.js"
// import * as pokeAPI from "./data/pokemonAPI.js"
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
} finally {
    // Close database connection
    await closeConnection();
    console.log('Connection closed. Done!');
}
*/