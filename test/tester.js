import { getLimitedCardDetails } from "../data/pokemonMongo.js";

let yourSelectedIds = ["hgss4-1", "pl1-1"];
let theirSelectedIds = ["dp3-1", "det1-1"];

let yourDetails = await Promise.all(
  yourSelectedIds.map(async (id) => {
    return await getLimitedCardDetails(id);
  })
);

console.log(yourDetails);
