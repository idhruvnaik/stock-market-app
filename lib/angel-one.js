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

const ltpData = async (exchangeType, symbol, symbol_token) => {
  try {
    let result = null;
    var data = JSON.stringify({
      exchange: exchangeType,
      tradingsymbol: symbol,
      symboltoken: symbol_token,
    });

    var config = {
      method: "post",
      url: "https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getLtpData",

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

module.exports = { authorize, ltpData };
