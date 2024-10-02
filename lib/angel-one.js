let { SmartAPI } = require("smartapi-javascript");
const otplib = require("otplib");
var axios = require("axios");

let cachedAuthDetails = null;

const authorize = async () => {
  try {
    if (cachedAuthDetails) {
      return cachedAuthDetails;
    } else {
      const smart_api = new SmartAPI({ api_key: "t7slrOfp" });
      const token = otplib.authenticator.generate("KAKY5PKI5H6EXA5IUMSFEFYRR4");
      let authDetails = await smart_api.generateSession(
        "D309388",
        "9586",
        token
      );

      cachedAuthDetails = authDetails;
      return authDetails;
    }
  } catch (error) {
    console.error("Error generating session => ", error);
    throw error;
  }
};

const ltpData = async (nfo_symbols) => {
  try {
    let result = null;

    var data = JSON.stringify({
      mode: "LTP",
      exchangeTokens: {
        NFO: nfo_symbols,
      },
    });

    var config = {
      method: "post",
      url: "https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote",

      headers: {
        Authorization: "Bearer " + cachedAuthDetails?.data?.jwtToken,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-UserType": "USER",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": "CLIENT_LOCAL_IP",
        "X-ClientPublicIP": "CLIENT_PUBLIC_IP",
        "X-MACAddress": "MAC_ADDRESS",
        "X-PrivateKey": "t7slrOfp",
      },
      data: data,
    };

    await axios(config)
      .then(function (response) {
        result = response?.data;
      })
      .catch(function (error) {
        throw error;
      });

    return result;
  } catch (error) {
    throw error;
  }
};

const holiday = async () => {
  const response = await axios.get(
    "https://www.nseindia.com/api/holiday-master?type=trading",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        Accept: "application/json, text/plain, */*",
        Referer: "https://www.nseindia.com/",
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );

  const holidays = response.data["FO"] || [];
  return holidays;
};

module.exports = { authorize, ltpData, holiday };
