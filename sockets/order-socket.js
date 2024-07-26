const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");
const constants = require("../config/constants");
const { subscribeToTicks } = require("../sockets/angel-one");

let pendingOrderDataEmiter = new Map();
let pendingOrderExecutor = new Map();

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

  for (const order of orders) {
    if (!pendingOrderDataEmiter.has(parseInt(order?.symbol_token))) {
      pendingOrderDataEmiter.set(parseInt(order?.symbol_token), []);
    }

    if (!pendingOrderExecutor.has(parseInt(order?.symbol_token))) {
      pendingOrderExecutor.set(parseInt(order?.symbol_token), [order]);
    } else {
      pendingOrderExecutor.get(parseInt(order?.symbol_token)).push(order);
    }
  }

  return pendingOrderDataEmiter;
}

async function channelData(data) {
  try {
    if (data?.token) {
      const cleanedString = data?.token?.replace(/"/g, "");
      const integerNumber = parseInt(cleanedString, 10);
      sendDataToClient(integerNumber, data);
      monitorUserOrders(integerNumber, data);
    }
  } catch (e) {
    throw new Error(e);
  }
}

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
    await updatePendingOrderData(ws, data);

    ws.on("close", (data) => {});
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
      status: constants.ORDER.STATUS.PENDING,
    },
    attributes: ["symbol_token"],
    raw: true,
  });

  tokens = tokens?.map((item) => item?.symbol_token);
  tokens?.forEach((token) => {
    if (pendingOrderDataEmiter.has(parseInt(token))) {
      pendingOrderDataEmiter.get(parseInt(token)).push(ws);
    }
  });
}

// ? Data Sender Functions()
async function sendDataToClient(integerNumber, data) {
  if (pendingOrderDataEmiter.has(integerNumber)) {
    const clients = pendingOrderDataEmiter.get(integerNumber);
    if (clients.length > 0) {
      clients?.forEach((wsClient) => {
        data.token = integerNumber || data?.token;
        wsClient.send(JSON.stringify(data));
      });
    }
  }
}

// ? Data Sender Functions()
async function monitorUserOrders(integerNumber, data) {
  if (pendingOrderExecutor.has(integerNumber)) {
    const orders = await pendingOrderExecutor.get(integerNumber);
    for (const order of orders) {
      const last_traded_price = (
        parseFloat(data?.last_traded_price) / 100
      ).toFixed(2);

      if (
        last_traded_price <= order?.reference_price &&
        order?.state == constants.ORDER.STATE.BUY
      ) {
        executeUserOrder(order, last_traded_price);
      }
    }
  }
}

async function executeUserOrder(order, price) {
  if (order) {
    await order.update({ trigger_price: price });
  }
}

function cleanupExecutedOrder() {
  // Cleanup from Map
}

subscribeToTicks(channelData);

init();
