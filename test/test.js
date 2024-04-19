import validation from "../data/validation.js";
import { userAccounts } from "../mongoConfig/mongoCollections.js";
import { getUserByUsername } from "../data/pokemonMongo.js";
import { closeConnection } from "../mongoConfig/mongoConnection.js";
import { getAllInfoByID } from "../data/pokemonAPI.js";

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
        } = await getAllInfoByID(pokeID);

        const price = cardmarket.prices.averageSellPrice;
        const image = images.small.replace(/\.png$/, "/portrait_uncanny.jpg");

        return {
          Name: name,
          Supertype: supertype,
          Subtypes: subtypes ? subtypes.join(", ") : "No Subtypes",
          HP: hp,
          Types: types ? types.join(", ") : "No Types",
          "Evolves From": evolvesFrom ? evolvesFrom : "No Evolve From",
          "Evolves To": evolvesTo ? evolvesTo.join(", ") : "No Evolve To",
          "Average Sell Price": price,
          Image: image,
        };
      })
    );

    return details;
  } catch (error) {
    throw `Error: ${error}`;
  }
};

let poop = await getUserCardDetails("jp");
console.log(poop);
