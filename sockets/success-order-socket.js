const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");
const constants = require("../config/constants");
const { subscribeToTicks } = require("./angel-one");
const { v4: uuidv4 } = require("uuid");

let successOrderDataEmitter = new Map();

const watchlistWS = new WebSocket.Server({
  port: constants.SOCKETS.SUCCESS_ORDER,
});

watchlistWS.on("connection", async (ws, req) => {
  const location = url.parse(req.url, true);
  const token = location.query.token;

  try {
    const data = await tokenUtil?.verifyAccessToken(token);
    if (data?.tokenDetails?.unique_token) {
      ws.unique_token = data?.tokenDetails?.unique_token;
      ws.id = generateUniqueToken();

      ws.on("message", async (message) => {
        const data = JSON.parse(message) || {};
        if (data?.symbol_tokens) {
          await updateSuccessOrderDataEmitter(ws, data?.symbol_tokens);
        }
      });
    } else {
      ws.close(1002, "Unauthorized");
    }

    ws.on("close", async (data) => {
      await removeWebSocket(ws);
    });
  } catch (error) {
    ws.send(JSON.stringify({ error: "Unauthorized" }));
    ws.close(1002, "Unauthorized");
    return;
  }
});

// ? Init Method
async function init() {
  try {
  } catch (e) {
    console.log(e);
  }
}

// ? Pending Order List
async function updateSuccessOrderDataEmitter(ws, tokens) {
  try {
    if (ws && tokens.length) {
      tokens?.forEach((token) => {
        if (successOrderDataEmitter.has(token)) {
          successOrderDataEmitter.get(token).push(ws);
        } else {
          successOrderDataEmitter.set(token, [ws]);
        }
      });
    }
  } catch (error) {
    throw error;
  }
}

function channelData(data) {
  if (data?.token) {
    const cleanedString =
      typeof data?.token === "string"
        ? data.token.replace(/"/g, "")
        : data?.token;
    const symbolToken = parseInt(cleanedString, 10);

    sendDataToClient(symbolToken, data);
  }
}

function generateUniqueToken() {
  const uuid = uuidv4();
  const timestamp = Date.now().toString(36);
  return `${uuid}-${timestamp}`;
}

// ? Data Sender Functions()
async function sendDataToClient(symbol_token, data) {
  try {
    if (successOrderDataEmitter.has(symbol_token)) {
      const clients = successOrderDataEmitter.get(symbol_token);

      if (clients.length > 0) {
        clients?.forEach((wsClient) => {
          data.token = symbol_token || data?.token;
          wsClient.send(JSON.stringify(data));
        });
      }
    }
  } catch (error) {}
}

subscribeToTicks(channelData);

init();
