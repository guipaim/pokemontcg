import axios from "axios";
import { getAllCards } from "./pokemonMongo.js";

/* This file handles all the data pulls from the API */

/**
 * Set X-Api-Key for faster API pulls
 * @returns header
 */
const getOptions = () => {
  const options = {
    headers: {},
  };

  options.headers["X-Api-Key"] = "9317594b-9eca-42c4-b240-fcbd37931adf";

  return options;
};

/**
 * This is just a helper method that randomizes the cards each new user gets
 * @returns a random number within the range of number of cards on the API
 */
const getRandomNumber = async (minimum, maximum) => {
  let min = minimum === null ? 0 : minimum;
  let max = maximum === null ? 17679 : maximum;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * This method is used by other methods to get specific information
 * often you need to get all the data to query
 * @returns all the card data for other methods
 */
export const fetchCardsData = async () => {
  try {
    const response = await axios.get(
      "https://api.pokemontcg.io/v2/cards",
      getOptions()
    );
    return response.data; // Extracting the data property from the response
  } catch (error) {
    console.error("Error fetching cards data:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

/**
 * This method is used by other methods to get specific information by ID
 * often you need to get all the data to query
 * @returns all the card data for other methods
 */
export const fetchCardsDataByID = async (id) => {
  if (!id) throw "Must supply id";

  try {
    let response = await axios.get(
      `https://api.pokemontcg.io/v2/cards/${id}`,
      getOptions()
    );
    if (!response.data) {
      throw "Could not get the card by ID";
    }
    const { data } = response.data;
    return data;
    // Extracting the data property from the response
  } catch (error) {
    console.error("Error fetching cards data by ID", error);
    throw error; // Rethrow the error for the caller to handle
  }
};
/**
 * have to make sure we give unique cards
 * @returns returns the 5 starting cards to the new user when created
 */
export const getStartingCards = async () => {
  let result = [];

  let data = await getAllCards();

  try {
    for (let i = 0; i < 5; i++) {
      let rn = await getRandomNumber(0, data.length);
      result.push(data[rn]);
    }
    return result;
  } catch (e) {
    console.log(e);
  }
};
/**
 *
 * @param {*} id id for the card on the API
 * @returns returns all card info for a specific card ID
 */
export const getAllInfoByID = async (id) => {
  let result = {};
  let { data } = await fetchCardsData();
  try {
    result = data.find((card) => card.id === id);
    return result;
  } catch (e) {
    console.error("Error getting card info by id:".e);
    throw e;
  }
};

/**
 *
 * @param {*} id id for the card on the API
 * @returns returns card HP info for a specific card ID
 */
export const getHPInfoByID = async (id) => {
  if (!id) throw "Must supply id";

  try {
    let response = await axios.get(
      `https://api.pokemontcg.io/v2/cards/${id}?select=hp`,
      getOptions()
    );
    if (!response.data) {
      throw "Could not get the card by ID";
    }
    const { data } = response.data;
    if (data !== undefined) {
      return data.hp;
    } else {
      return 30;
    }

    // Extracting the data property from the response
  } catch (error) {
    console.error("Error fetching cards data by ID", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

/**
 *
 * @param {*} cardId param is the card ID, same as just above
 * @returns the imageURL for the card by ID
 */
export const getImageUrlByCardId = async (cardId) => {
  try {
    const data = await fetchCardsDataByID(cardId);
    //console.log('api data', data)
    //console.log('api img', data.images.small)
    if (data) {
      return data.images.small;
    } else {
      return null; // Card not found
    }
  } catch (error) {
    console.error("Error getting image URL by card ID:", error);
    throw error;
  }
};

export async function getRandomCard(cardList) {
  if (cardList.length === 0) {
    throw new Error("Card List is empty");
  }
  let rn = await getRandomNumber(0, cardList.length);
  let card = cardList[rn];
  return card;
}

//export default exportedMethods;
