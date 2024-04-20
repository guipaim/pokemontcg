import { userAccounts, allCards } from "../mongoConfig/mongoCollections.js";
import validation from "./validation.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { fetchCardsDataByID } from "./pokemonAPI.js";
import allPokeCards from "../pokemonTCG.allCards.json" assert {type: 'json'};

/**
 *
 * @param {*} username username of the user
 * @returns all info in mongo on that user
 */
export const getUserByUsername = async (userName) => {
  if (!userName) {
    throw new Error("Must supply a user name");
  }
  let userNameCheckResult = validation.checkString(userName, userName);

  if (userNameCheckResult) {
    userName = userName.toLowerCase().trim();
  } else {
    throw new Error("Invalid User Name.");
  }

  try {
    const userAccountsCollection = await userAccounts();
    const user = await userAccountsCollection.findOne({ userName: userName });
    console.log("User: ", user);
    if (!user) {
      throw new Error(`No user found with the username: ${userName}`); //added check to see if user even exists, if not throw error. Need to check if anyone is resolving this error on their own by calling a null
    }
    return user;
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw error;
  }
};

export const loginUser = async (userName, password) => {
  let username;
  let userNameCheckResult;
  let passwordCheckResult;
  const userAccountsCollection = await userAccounts();

  if (!userName || !password) {
    throw new Error("Must supply a User Name and a Password");
  } else {
    userNameCheckResult = validation.checkString(userName, username);
    passwordCheckResult = validation.checkPassword(password);
  }

  if (userNameCheckResult) {
    username = userName.toLowerCase().trim();
  } else {
    throw new Error("Invalid User Name.");
  }

  if (!passwordCheckResult) {
    throw new Error("Password is invalid.");
  }

  const user = await userAccountsCollection.findOne({ userName: userName });
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    return {
      userName: user.userName,
    };
  } else {
    throw new Error("User Name or Password is invalid");
  }
};

/**
 *
 * @param {*} username username of the user
 * @returns the cardlist of that user
 */
export const getCardListByUsername = async (username) => {
  try {
    const user = await getUserByUsername(username);
    if (user) {
      return user.cardList;
    } else {
      return null; // User not found
    }
  } catch (error) {
    console.error("Error getting card list by username:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  id = validation.checkId(id);
  const userCollection = await userAccounts();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });
  if (!user) throw "Error: User not found";
  return user;
};

export const getAllUsers = async () => {
  const userCollection = await userAccounts();
  const userList = await userCollection.find({}).toArray();
  return userList;
};

export const getUserCardDetails = async (username) => {
  let user;
  try {
    user = await getUserByUsername(username);
  } catch (error) {
    throw `Error: ${error}`;
  }
  const cardList = user.cardList;
  try {
    const details = await Promise.all(
      cardList.map(async (pokeID) => {
        const {
          name,
          supertype,
          subtypes,
          hp,
          types,
          evolvesFrom,
          evolvesTo,
          cardmarket,
          images,
        } = await fetchCardsDataByID(pokeID);

        const price = cardmarket.prices.averageSellPrice;
        const image = images.small;
        // const image = images.small.replace(/\.png$/, "/portrait_uncanny.jpg");
        const link = cardmarket.url;

        return {
          id: pokeID,
          Name: name,
          Supertype: supertype,
          Subtypes: subtypes ? subtypes.join(", ") : "No Subtypes",
          HP: hp,
          Types: types ? types.join(", ") : "No Types",
          "Evolves From": evolvesFrom ? evolvesFrom : "No Evolve From",
          "Evolves To": evolvesTo ? evolvesTo.join(", ") : "No Evolve To",
          "Average Sell Price": price,
          image: image,
          link: link,
        };
      })
    );

    return details;
  } catch (error) {
    throw `Error: ${error}`;
  }
};

export async function growCollection(){
  const userAccountsCollection = await userAccounts();
  const usersList = userAccountsCollection.find({}).toArray();
}

export async function loadAllCards(){
  const allCardsCollection = await allCards();
  await allCardsCollection.drop();
  await allCardsCollection.insertOne({cards: allPokeCards.cards});
}

export async function getAllCards(){
  const allCardsCollection = await allCards();
  const cards = await allCardsCollection.find({}).toArray();
  return (cards[0].cards);
}
