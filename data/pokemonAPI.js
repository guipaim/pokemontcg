//import { userAccounts } from "./mongoConfig/mongoCollections.js";
//import {ObjectId} from 'mongodb';
import axios from "axios";

/* This file handles all the data pulls from the API */

/**
 * This is just a helper method that randomizes the cards each new user gets
 * @returns a random number within the range of number of cards on the API
 */
const getRandomNumber = async () => {
  let min = 0;
  let max = 250;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
/**
 * This method is used by other methods to get specific information
 * often you need to get all the data to query
 * @returns all the card data for other methods
 */
export const fetchCardsData = async () => {
  try {
    const response = await axios.get("https://api.pokemontcg.io/v2/cards");
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
    let response = await axios.get(`https://api.pokemontcg.io/v2/cards/${id}`);
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
  //let {data} = await axios.get('https://api.pokemontcg.io/v2/cards')
  let data = await fetchCardsData();

  try {
    for (let i = 0; i < 5; i++) {
      let rn = await getRandomNumber();
      result.push(data.data[rn].id);
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
 * @param {*} cardId param is the card ID, same as just above
 * @returns the imageURL for the card by ID
 */
export const getImageUrlByCardId = async (cardId) => {
  try {
    let card = {};
    const { data } = await fetchCardsData();
    card = data.find((card) => card.id === cardId);
    if (card) {
      return card.images.small;
    } else {
      return null; // Card not found
    }
  } catch (error) {
    console.error("Error getting image URL by card ID:", error);
    throw error;
  }
};

//export default exportedMethods;
