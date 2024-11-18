const axios = require("axios");

const getCryptoData = async () => {
  try {
    const response = await axios.get("https://api.coincap.io/v2/assets");
    return response.data;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
  }
};
