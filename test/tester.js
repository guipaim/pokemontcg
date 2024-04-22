import { userAccounts } from "../mongoConfig/mongoCollections.js";
import { getTradeDetails } from "../data/pokemonMongo.js";
import { ObjectId } from "mongodb";

export const finalizeTrade = async (id) => {
  const userCollection = await userAccounts();
  id = new ObjectId(id);
  const query = await userCollection
    .find({ "incomingTrades.id:": id })
    .toArray();

  return query;
};

let out = await finalizeTrade("6625b10226a0778e9a7b36e0");
console.log(out);
