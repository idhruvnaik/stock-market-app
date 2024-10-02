const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");
const constants = require("../config/constants");
const { subscribeToTicks } = require("./angel-one");
const { v4: uuidv4 } = require("uuid");

let portfolioOrder = new Map();

const watchlistWS = new WebSocket.Server({
  port: constants.SOCKETS.PORTFOLIO,
});

watchlistWS.on("connection", async (ws, req) => {
  const location = url.parse(req.url, true);
  const token = location?.query?.token;

  try {
    const data = await tokenUtil?.verifyAccessToken(token);
    if (data?.tokenDetails?.unique_token) {
      ws.unique_token = data?.tokenDetails?.unique_token;
      ws.id = generateUniqueToken();
    } else {
      ws.close(1002, "Unauthorized");
    }

    await updateClientObserver(ws, data);

    ws.on("close", async (code) => {
      await removeWebSocket(ws);
    });
  } catch (error) {
    ws.send(JSON.stringify({ error: "Unauthorized" }));
    ws.close(1002, "Unauthorized");
    return;
  }
});

async function updateClientObserver(ws, data) {
  let tokens = await db.UserOrder.findAll({
    where: {
      user_token: data["tokenDetails"]["unique_token"],
      status: constants.ORDER.STATUS.SUCCESS,
    },
    attributes: ["symbol_token"],
    raw: true,
  });

  tokens = tokens?.map((item) => item?.symbol_token);

  tokens?.forEach((token) => {
    if (portfolioOrder.has(parseInt(token))) {
      portfolioOrder.get(parseInt(token)).push(ws);
    }

    if (!portfolioOrder.has(parseInt(token))) {
      portfolioOrder.set(parseInt(token), [ws]);
    }
  });
}

async function channelData(data) {
  try {
    if (data?.token) {
      const cleanedString =
        typeof data?.token === "string"
          ? data.token.replace(/"/g, "")
          : data?.token;
      const integerNumber = parseInt(cleanedString, 10);

      if (portfolioOrder.has(integerNumber)) {
        const clients = portfolioOrder.get(integerNumber);
        if (clients.length > 0) {
          clients?.forEach((wsClient) => {
            data.token = integerNumber || data?.token;
            wsClient.send(JSON.stringify(data));
          });
        }
      }
    }
  } catch (e) {
    throw new Error(e);
  }
}

function generateUniqueToken() {
  const uuid = uuidv4();
  const timestamp = Date.now().toString(36);
  return `${uuid}-${timestamp}`;
}

// !! Function to remove WebSocket from the map
async function removeWebSocket(ws) {
  for (const [token, sockets] of portfolioOrder) {
    const updatedSockets = sockets?.filter((socket) => socket.id !== ws.id);

    if (updatedSockets?.length !== sockets?.length) {
      portfolioOrder.set(token, updatedSockets);
    }
  }
}

subscribeToTicks(channelData);
