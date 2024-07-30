const db = require("../models/index");

const EventEmitter = require("events");
let { WebSocketV2 } = require("smartapi-javascript");
const { authorize } = require("../lib/angel-one");

const eventEmitter = new EventEmitter();
let tokens = [];

const initializeWebSocket = async () => {
  try {
    await fetchTokens();
    const auth = await authorize();
    websocketInit(auth);
  } catch (error) {
    throw error;
  }
};

// ? Populate User List
async function fetchTokens() {
  try {
    const symbols = await db.Symbol.findAll();
    tokens = await Promise.all(
      symbols?.map(async (symbol) => {
        return symbol?.token;
      })
    );
    return tokens;
  } catch (error) {
    throw error;
  }
}

function websocketInit(auth) {
  try {
    let socket = new WebSocketV2({
      jwttoken: auth?.data?.jwtToken,
      apikey: "t7slrOfp",
      clientcode: "D309388",
      feedtype: auth?.data?.feedToken,
    });

    socket.connect().then((res) => {
      let object = {
        correlationID: "correlation_id",
        action: 1,
        mode: 2,
        exchangeType: 2,
        tokens: tokens,
        params: 1,
      };

      socket.fetchData(object);
      socket.on("tick", function (data) {
        eventEmitter.emit("tick", data);
      });
    });
  } catch (error) {
    throw error;
  }
}

initializeWebSocket();

const subscribeToTicks = (callback) => {
  eventEmitter.on("tick", callback);
};

module.exports = { subscribeToTicks };
