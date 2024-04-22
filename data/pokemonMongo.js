import { userAccounts, allCards } from "../mongoConfig/mongoCollections.js";
import validation from "./validation.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { fetchCardsDataByID, getRandomCard } from "./pokemonAPI.js";
import allPokeCards from "../pokemonTCG.allCards.json" assert { type: "json" };

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

// START OF JAYS FUNCTIONS

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

export const getLimitedCardDetails = async (pokeID) => {
  try {
    const { name, cardmarket, images } = await fetchCardsDataByID(pokeID);

    const image = images.small;
    const link = cardmarket.url;

    return {
      id: pokeID,
      name: name,
      image: image,
      link: link,
    };
  } catch (error) {
    throw `Error: ${error}`;
  }
};

export const executeTrade = async (sender, reciever, outgoing, incoming) => {
  let tradeOut;
  let tradeIn;

  const userAccountsCollection = await userAccounts();
  let oidOne = new ObjectId();
  tradeOut = await userAccountsCollection.findOneAndUpdate(
    { userName: sender },
    {
      $push: {
        outgoingTrades: { id: oidOne, outgoing: incoming, incoming: outgoing },
      },
    }
  );

  if (!tradeOut) {
    throw `Could not complete outgoing trade`;
  }

  tradeIn = await userAccountsCollection.findOneAndUpdate(
    { userName: reciever },
    {
      $push: {
        incomingTrades: { id: oidOne, incoming: incoming, outgoing: outgoing },
      },
    }
  );

  if (!tradeIn) {
    throw `Could not complete incoming trade`;
  }

  return tradeOut, tradeIn;
};

export const getTradeDetails = async (username) => {
  const userAccountsCollection = await userAccounts();
  const userTrades = await userAccountsCollection.findOne(
    { userName: username },
    { projection: { _id: 0, incomingTrades: 1, outgoingTrades: 1 } }
  );

  const incomingTrades = userTrades.incomingTrades; //ex user is jp
  // let tradesIn_In = []; //incoming trades what cards you will get [..., {kp: ['poke1']}, ...]
  // let tradesIn_Out = []; //incoming trades what cards you will give [..., {jp:['poke2']}, ...]
  let tradesIn = []; // [ [ { kp: [Array] }, { jp: [Array] } ], [another trade] ]
  incomingTrades.forEach((trades) => {
    // tradesIn_In.push(trades.incoming);
    // tradesIn_Out.push(trades.outgoing);
    trades.id = trades.id.toString();
    tradesIn.push([trades.id, trades.incoming, trades.outgoing]);
  });

  const outgoingTrades = userTrades.outgoingTrades;
  // let tradesOut_In = []; //outgoing trades what cards you will get [..., {kp: ['poke3']}, ...]
  // let tradesOut_Out = []; //outgoing trades what cards you will give [..., {jp: ['poke3']}, ...]
  let tradesOut = []; // [ [ { kp: [Array] }, { jp: [Array] } ], [ { kp: [Array] }, { jp: [Array] } ]]
  outgoingTrades.forEach((trades) => {
    // tradesOut_In.push(trades.incoming);
    // tradesOut_Out.push(trades.outgoing);
    trades.id = trades.id.toString();
    tradesOut.push([trades.id, trades.incoming, trades.outgoing]);
  });

  return { tradesIn: tradesIn, tradesOut: tradesOut };
};

export const finalizeTrade = async (id) => {
  const userCollection = await userAccounts();
  id = new ObjectId(id);

  let deleteTrade;
  let incomingTrade;

  try {
    incomingTrade = await userCollection
      .aggregate([
        { $match: { "incomingTrades.id": id } },
        {
          $project: {
            _id: 0,
            userName: 1,
            incomingTrades: {
              $filter: {
                input: "$incomingTrades",
                as: "trade",
                cond: { $eq: ["$$trade.id", id] },
              },
            },
          },
        },
      ])
      .toArray();
  } catch (error) {
    console.log(error);
  }

  let singleTrade = incomingTrade[0].incomingTrades[0]; //only one trade with id exists

  let tradeIn = singleTrade.incoming;
  let tradeOut = singleTrade.outgoing;

  let userTradeRequestMaker = Object.keys(tradeIn)[0]; // Gets the first key of the object
  let userTradeRequestMakerCollection = await getCardListByUsername(
    userTradeRequestMaker
  );
  let cardArrayOne = tradeIn[userTradeRequestMaker];

  let userTradeRequestAcceptor = Object.keys(tradeOut)[0];
  let userTradeRequestAcceptorCollection = await getCardListByUsername(
    userTradeRequestAcceptor
  );
  let cardArrayTwo = tradeOut[userTradeRequestAcceptor];

  //   console.log(
  //     `Trade made by: ${userTradeRequestMaker}, the cards are ${cardArrayOne}`
  //   );

  //   console.log(
  //     `Trade accepted by: ${userTradeRequestAcceptor}, the cards are ${cardArrayTwo}`
  //   );

  for (const card of cardArrayOne) {
    try {
      await userCollection.updateOne(
        { userName: userTradeRequestMaker },
        { $pull: { cardList: card } }
      );
    } catch (error) {
      console.error("Error pulling card from cardList:", error);
    }
  } //remove cards that trademaker is giving up

  for (const card of cardArrayTwo) {
    try {
      await userCollection.updateOne(
        { userName: userTradeRequestAcceptor },
        { $pull: { cardList: card } }
      );
    } catch (error) {
      console.error("Error pulling card from cardList:", error);
    }
  } //remove cards that tradeacceptor is giving up

  for (const card of cardArrayOne) {
    try {
      await userCollection.updateOne(
        { userName: userTradeRequestAcceptor },
        { $push: { cardList: card } }
      );
    } catch (error) {
      console.error("Error pushing card from cardList:", error);
    }
  } //inserts cards into tradeacceptor that trademaker is giving up

  for (const card of cardArrayTwo) {
    try {
      await userCollection.updateOne(
        { userName: userTradeRequestMaker },
        { $push: { cardList: card } }
      );
    } catch (error) {
      console.error("Error pulling card from cardList:", error);
    }
  } //insert cards into traderequestor  that tradeacceptor is giving up

  try {
    deleteTrade = await userCollection.updateMany(
      {},
      {
        $pull: {
          incomingTrades: { id: { $eq: id } },
          outgoingTrades: { id: { $eq: id } },
        },
      }
    );
  } catch (err) {
    console.error(err);
  }
};
//end of JAYS functions

export async function loadAllCards() {
  try {
    const allCardsCollection = await allCards();
    await allCardsCollection.drop();
    await allCardsCollection.insertOne({ cards: allPokeCards.cards });
  } catch (e) {
    console.log("Unable to create collection of all cards");
  }
}

export async function getAllCards() {
  try {
    const allCardsCollection = await allCards();
    const cards = await allCardsCollection.find({}).toArray();
    return cards[0].cards;
  } catch (e) {
    console.log("Unable to retrieve card list from DB", e);
  }
}

export async function growCollection() {
  try {
    const userAccountsCollection = await userAccounts();
    const usersList = await userAccountsCollection.find({}).toArray();
    const allCardsList = await this.getAllCards();
    //const oneDay = 24 * 60 * 60 * 1000;
    const tenMin = 60000 * 10;

    for (let user in usersList) {
      const date = Date.now();
      const allowGrowth = date - usersList[user].lastCollectionGrowth > tenMin;

      if (allowGrowth) {
        let card = await getRandomCard(allCardsList);
        let id = usersList[user]._id;
        let cardList = usersList[user].cardList;
        cardList.push(card);
        await userAccountsCollection.updateOne(
          { _id: id },
          { $set: { cardList: cardList, lastCollectionGrowth: Date.now() } }
        );
      }
    }
  } catch (e) {
    console.log("Failed to grow user collection: ", e);
  }
}
