import { userAccounts, allCards } from "../mongoConfig/mongoCollections.js";
import validation from "./validation.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import {
  fetchCardsDataByID,
  getImageUrlByCardId,
  getRandomCard,
  getHPInfoByID,
} from "./pokemonAPI.js";
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

export const findUsersByUsernameSubstring = async (substring) => {
  if (!substring) {
    throw new Error("Must supply search term");
  }
  let substringCheckResult = validation.checkString(substring, substring);

  if (substringCheckResult) {
    substring = substring.toLowerCase().trim();
  } else {
    throw new Error("Invalid search query.");
  }

  try {
    const userAccountsCollection = await userAccounts();
    const users = await userAccountsCollection.find({ userName: { $regex: substring, $options: 'i' } 
  }).toArray();
    if (!users) {
      throw new Error(`No user found with the username: ${userName}`); //added check to see if user even exists, if not throw error. Need to check if anyone is resolving this error on their own by calling a null
    }
    return users;
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw error;
  }
}

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
    username = userName.toLowerCase().trim(); // Convert username to lowercase
  } else {
    throw new Error("Invalid User Name.");
  }

  if (!passwordCheckResult) {
    throw new Error("Password is invalid.");
  }

  const user = await userAccountsCollection.findOne({ userName: username });
  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    return {
      userName: user.userName,
      friendRequests: user.friendRequests
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
  if (!username) {
    throw "You must supply a username";
  }

  let userNameCheckResult = validation.checkString(username, username);

  if (userNameCheckResult) {
    username = username.toLowerCase().trim();
  } else {
    throw new Error("Invalid User Name.");
  }

  let user;

  try {
    user = await getUserByUsername(username);
  } catch (error) {
    throw `Error: ${error}`;
  }
  let cardList = user.cardList;
  try {
    cardList = cardList.filter(
      (item) => typeof item === "string" && item.trim() !== ""
    );

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

        const price = cardmarket?.prices?.averageSellPrice;
        const image = images.small;
        const link = cardmarket?.url;

        return {
          id: pokeID ? pokeID : "No ID",
          Name: name ? name : "No name",
          Supertype: supertype ? supertype : "No supertype",
          Subtypes: subtypes ? subtypes.join(", ") : "No Subtypes",
          HP: hp ? hp : "No HP",
          Types: types ? types.join(", ") : "No Types",
          "Evolves From": evolvesFrom ? evolvesFrom : "No Evolve From",
          "Evolves To": evolvesTo ? evolvesTo.join(", ") : "No Evolve To",
          "Average Sell Price": price ? price : "No price",
          image: image ? image : "../public/images/No-image-found.jpg",
          link: link ? link : "javascript:void(0);",
        };
      })
    );

    return details;
  } catch (error) {
    throw `Error: ${error}`;
  }
};

export const getLimitedCardDetails = async (pokeID) => {
  pokeID = pokeID.trim();

  if (!pokeID || pokeID === "" || typeof pokeID !== "string") {
    throw "You must enter a valid pokemon ID";
  }

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
  if (!sender || !reciever || !outgoing || !incoming) {
    throw "All arguments must be supplied";
  }

  if (typeof sender !== "string" || typeof reciever !== "string") {
    throw "senders and receivers must be string values";
  }

  sender = sender.trim();
  reciever = reciever.trim();

  if (sender === "" || reciever === "") {
    throw "senders and receivers cannot be empty strings";
  }

  if (typeof outgoing !== "object" || typeof incoming !== "object") {
    throw "out going and incoming trades must be objects";
  }

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
  if (!username) {
    throw "You must supply a username";
  }

  let userNameCheckResult = validation.checkString(username, username);

  if (userNameCheckResult) {
    username = username.toLowerCase().trim();
  } else {
    throw new Error("Invalid User Name.");
  }

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
  if (!id) {
    throw "ID must be supplied";
  }

  id = id.trim();
  if (id === "") {
    throw "ID must be nonempty";
  }

  if (!ObjectId.isValid(id)) {
    throw "ID is not a valid object ID";
  }

  const userCollection = await userAccounts();
  id = new ObjectId(id);

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

  let cardArrayOne = tradeIn[userTradeRequestMaker];

  let userTradeRequestAcceptor = Object.keys(tradeOut)[0];

  let cardArrayTwo = tradeOut[userTradeRequestAcceptor];

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
    let deleteTrade = await userCollection.updateMany(
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

  for (const card of cardArrayOne) {
    try {
      let deleteRest = await removeTradesByCardName(card);
    } catch (error) {
      console.error("Error deleting rest of the cards", error);
    }
  } //deletes other trades

  for (const card of cardArrayTwo) {
    try {
      let deleteRest = await removeTradesByCardName(card);
    } catch (error) {
      console.error("Error deleting rest of the cards", error);
    }
  }

  await updateDeckPoints();
};

export const declineTrade = async (id) => {
  if (!id) {
    throw "ID must be supplied";
  }

  id = id.trim();
  if (id === "") {
    throw "ID must be nonempty";
  }

  if (!ObjectId.isValid(id)) {
    throw "ID is not a valid object ID";
  }

  const userCollection = await userAccounts();
  id = new ObjectId(id);

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

export const removeTradesByCardName = async (cardName) => {
  if (!cardName) {
    throw "No card ID supplied";
  }

  if (typeof cardName !== "string") {
    throw "Card name must be string value";
  }

  cardName = cardName.trim();

  if (cardName === "") {
    throw "Card name cannot be empty";
  }

  const userAccountsCollection = await userAccounts();

  const query = [
    {
      $project: {
        outgoingTrades: {
          $filter: {
            input: "$outgoingTrades",
            as: "trade",
            cond: {
              $or: [
                {
                  $anyElementTrue: {
                    $map: {
                      input: { $objectToArray: "$$trade.outgoing" },
                      as: "outItems",
                      in: { $in: [cardName, "$$outItems.v"] },
                    },
                  },
                },
                {
                  $anyElementTrue: {
                    $map: {
                      input: { $objectToArray: "$$trade.incoming" },
                      as: "inItems",
                      in: { $in: [cardName, "$$inItems.v"] },
                    },
                  },
                },
              ],
            },
          },
        },
        incomingTrades: {
          $filter: {
            input: "$incomingTrades",
            as: "trade",
            cond: {
              $or: [
                {
                  $anyElementTrue: {
                    $map: {
                      input: { $objectToArray: "$$trade.outgoing" },
                      as: "outItems",
                      in: { $in: [cardName, "$$outItems.v"] },
                    },
                  },
                },
                {
                  $anyElementTrue: {
                    $map: {
                      input: { $objectToArray: "$$trade.incoming" },
                      as: "inItems",
                      in: { $in: [cardName, "$$inItems.v"] },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $match: {
        $or: [{ outgoingTrades: { $ne: [] } }, { incomingTrades: { $ne: [] } }],
      },
    },
    {
      $project: {
        tradeIds: {
          $setUnion: [
            {
              $map: { input: "$outgoingTrades", as: "trade", in: "$$trade.id" },
            },
            {
              $map: { input: "$incomingTrades", as: "trade", in: "$$trade.id" },
            },
          ],
        },
        _id: 0,
      },
    },
  ];
  let results;

  try {
    results = await userAccountsCollection.aggregate(query).toArray();
  } catch (error) {
    console.error(err);
  }

  results = results
    .map((item) => item.tradeIds.map((id) => id.toString()))
    .flat();
  results = [...new Set(results)];

  results = results.map((item) => new ObjectId(item));

  try {
    const deleteTrade = await userAccountsCollection.updateMany(
      {},
      {
        $pull: {
          incomingTrades: { id: { $in: results } },
          outgoingTrades: { id: { $in: results } },
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
    await updateDeckPoints();
  } catch (e) {
    console.log("Failed to grow user collection: ", e);
  }
}

export const getAllUserDeckPoints = async () => {
  try {
    const users = await getAllUsers();
    let rankList = [];

    for (let i in users) {
      rankList.push({
        userName: users[i].userName,
        deckPoints: users[i].deckPoints,
      });
    }

    rankList.sort(function (a, b) {
      return Number(b.deckPoints) - Number(a.deckPoints);
    });

    for (let i in rankList) {
      rankList[i]["rank"] = Number(i) + 1;
    }

    return rankList;
  } catch (error) {
    console.log("Failed to get rank list: ", error);
  }
};

export const updateDeckPoints = async () => {
  try {
    const users = await getAllUsers();
    let rankList = [];

    for (let i in users) {
      let deckPoints = 0;
      for (let j in users[i].cardList) {
        let cardHP = await getHPInfoByID(users[i].cardList[j]);
        deckPoints += Number(cardHP);
      }

      rankList.push({ userName: users[i].userName, deckPoints: deckPoints });
      const userAccountsCollection = await userAccounts();
      await userAccountsCollection.updateOne(
        { _id: users[i]._id },
        { $set: { deckPoints: deckPoints } }
      );
    }
  } catch (error) {
    console.log("Failed to update user deck points: ", error);
  }
};

export const rewardTop3Players = async () => {
  try {
    const rankList = await getAllUserDeckPoints();
    for (
      let i = 0;
      i <= (rankList.length >= 3 ? 2 : rankList.length - 1);
      i++
    ) {
      let name = rankList[i].userName;
      let user = await getUserByUsername(name);
      const allCardsList = await getAllCards();
      let card = await getRandomCard(allCardsList);
      let id = user._id;
      let cardList = user.cardList;
      cardList.push(card);
      const userAccountsCollection = await userAccounts();
      await userAccountsCollection.updateOne(
        { _id: id },
        { $set: { cardList: cardList } }
      );
    }
    await updateDeckPoints();
  } catch (error) {
    console.log("Failed to reward top 3 players: ", error);
  }
};

export async function displayCollection(user) {
  try {
    var cards = await getCardListByUsername(user);
    //console.log("cards", cards)
    let imageArr = [];
    for (let x of cards) {
      let img = await getImageUrlByCardId(x);
      imageArr.push(img);
    }
    //await displayImages(imageArr);
    return imageArr;
  } catch (e) {
    console.log("Error Displaying Collection: ", e);
  }
}
export async function displayImages(imageUrls) {
  var container = document.getElementById("image-container");
  container.innerHTML = "";
  imageUrls.forEach(function (url) {
    var img = document.createElement("img");
    img.src = url;
    img.alt = "Card Image";
    container.appendChild(img);
  });
}

export async function getFriendList(user) {
  try {
    const userCollection = await userAccounts();
    const userInfo = await userCollection.findOne({ userName: user });
    //console.log("userInfo", userInfo)
    //console.log("friend list" , userInfo.friendList)
    if (userInfo) {
      if (userInfo.friendList.length === 0) {
        let list = [];
        //list.push(user)
        return list;
      } else {
        return userInfo.friendList;
      }
    } else {
      console.log(`User "${user}" not found.`);
      return [];
    }
  } catch (e) {
    console.log("Failed to get friend list: ", e);
  }
}
