import axios from "axios";

const getOptions = () => {
    const options = {
        headers: {}
    };


    options.headers['X-Api-Key'] = 'cfd6a01d-6c77-4dd3-b607-dbb40c31cba8';

    return options;
}

export async function fetchAllCards() {
    try {
        const queryInfo = await axios.get("https://api.pokemontcg.io/v2/cards?page=1&pageSize=250", getOptions());
        let allCards = [];
        let totalCount = queryInfo.data.totalCount;
        let pageSize = queryInfo.data.pageSize;
        let totalPages = Math.floor(totalCount / pageSize) + 1;
        let currentPage = queryInfo.data.page;

        for (let i = currentPage; i <= totalPages; i++) {
            const response = await axios.get(`https://api.pokemontcg.io/v2/cards?page=${i}&pageSize=250&select=id`, getOptions());
            for (let card in response.data.data) {
                console.log(response.data.data[card].id);
                allCards.push(response.data.data[card].id);
                console.log(i);
            }
        }

        return allCards; // Extracting the data property from the response
    } catch (error) {
        console.error("Error fetching cards data:", error);
        throw error; // Rethrow the error for the caller to handle
    }
};