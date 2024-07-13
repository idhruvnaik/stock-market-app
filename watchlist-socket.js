const WebSocket = require("ws");
const otplib = require("otplib");
const db = require("./models/index");
const tokenUtil = require("./utils/tokenUtil");
const url = require("url");

const watchlistWS = new WebSocket.Server({ port: 8080 });

let { SmartAPI, WebSocketV2 } = require("smartapi-javascript");

let smart_api = null; // Angel One API.
let socket = null; // Angel One Socket.
let userObserver = new Map();

async function init() {
  try {
    userObserver = await makeUserList();
    configureSmartAPI();
  } catch (e) {
    console.log(e);
  }
}

// ? Populate User List
async function makeUserList() {
  const symbols = await db.Symbol.findAll();
  symbols?.forEach((element) => {
    if (!userObserver.has(element?.token)) {
      userObserver.set(element?.token, []);
    }
  });

  return userObserver;
}

function configureSmartAPI() {
  try {
    smart_api = new SmartAPI({ api_key: "t7slrOfp" });
    const token = otplib.authenticator.generate("KAKY5PKI5H6EXA5IUMSFEFYRR4");

    smart_api.generateSession("D309388", "9586", token).then((auth) => {
      socket = new WebSocketV2({
        jwttoken: auth?.data?.jwtToken,
        apikey: "t7slrOfp",
        clientcode: "D309388",
        feedtype: auth?.data?.feedToken,
      });

      channelData();
    });
  } catch (e) {
    throw new error(e);
  }
}

async function channelData() {
  try {
    tokens = Array.from(userObserver.keys());
    socket.connect().then((data) => {
      let object = {
        correlationID: "correlation_id",
        action: 1,
        mode: 1,
        exchangeType: 1,
        tokens: tokens,
        params: 1,
      };

      socket.fetchData(object);

      socket.on((data) => {});
    });
  } catch (e) {
    throw new Error(e);
  }
}

watchlistWS.on("connection", async (ws, req) => {
  const location = url.parse(req.url, true);
  const token = location.query.token;

  try {
    const decoded = await tokenUtil?.verifyAccessToken(token);
    ws.client = decoded;
    ws.on("close", () => {
      console.log("Closed..");
    });
  } catch (error) {
    ws.send(JSON.stringify({ error: "Unauthorized" }));
    ws.close(1002, "Unauthorized"); // Protocol Error
    return;
  }
});

setInterval(() => {
  console.log(`Number of active connections: ${watchlistWS.clients.size}`);
  watchlistWS?.clients?.forEach((ws) => {
    ws.send(
      JSON.stringify({
        stock: "AAPL",
        data: {},
        additionalData: "Empty",
      })
    );
  });
}, 5000);

module.exports = { init };
init();