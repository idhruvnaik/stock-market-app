const db = require("../models/index");

const EventEmitter = require("events");
let { WebSocketV2 } = require("smartapi-javascript");
const { authorize } = require("../lib/angel-one");
const moment = require("moment");

const eventEmitter = new EventEmitter();
let tokens = [];

const cutoffTime = moment()
  .tz("Asia/Kolkata")
  .set({ hour: 15, minute: 30, second: 0, millisecond: 0 });

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
        const now = moment().tz("Asia/Kolkata");
        if (now.isAfter(cutoffTime)) {
          setInterval(function () {
            const randomValue = Math.floor(Math.random() * 41) - 20;
            const last_traded_price = (
              (parseInt(data?.last_traded_price) || 0) + randomValue || 0
            ).toString();
            data.last_traded_price = last_traded_price;
            eventEmitter.emit("tick", data);
          }, 1000);
        } else {
          eventEmitter.emit("tick", data);
        }
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
