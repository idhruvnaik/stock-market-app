const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");
const constants = require("../config/constants");
const { subscribeToTicks } = require("../sockets/angel-one");

let pendingOrderDataEmiter = new Map();

const watchlistWS = new WebSocket.Server({
  port: constants.SOCKETS.PENDING_ORDER,
});

async function init() {
  try {
    pendingOrderDataEmiter = await pendingOrders();
  } catch (e) {
    console.log(e);
  }
}

// ? Pending Order List
async function pendingOrders() {
  const orders = await db.UserOrder.findAll({
    where: { status: constants.ORDER.STATUS.PENDING },
  });

  orders?.forEach((element) => {
    if (!pendingOrderDataEmiter.has(parseInt(element?.token))) {
      pendingOrderDataEmiter.set(parseInt(element?.token), []);
    }
  });

  return pendingOrderDataEmiter;
}

async function channelData(data) {}

watchlistWS.on("connection", async (ws, req) => {
  const location = url.parse(req.url, true);
  const token = location.query.token;

  try {
    const data = await tokenUtil?.verifyAccessToken(token);
    if (data?.tokenDetails?.unique_token) {
      ws.unique_token = data?.tokenDetails?.unique_token;
    } else {
      ws.close(1002, "Unauthorized");
    }
    // await updatePendingOrderData(ws, data);

    ws.on("close", (data) => {
    });
  } catch (error) {
    ws.send(JSON.stringify({ error: "Unauthorized" }));
    ws.close(1002, "Unauthorized");
    return;
  }
});

async function updatePendingOrderData(ws, data) {
  let tokens = await db.UserOrder.findAll({
    where: {
      user_token: data["tokenDetails"]["unique_token"],
    },
    attributes: ["symbol_token"],
    raw: true,
  });

  tokens = tokens?.map((item) => item?.symbol_token);
  tokens?.forEach((token) => {
    if (userObserver.has(parseInt(token))) {
      userObserver.get(parseInt(token)).push(ws);
    }
  });
}

subscribeToTicks(channelData);

init();
