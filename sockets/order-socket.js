const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");
const constants = require("../config/constants");
const { subscribeToTicks } = require("../sockets/angel-one");
const { placeOrderLib, listLib, cancelOrderLib } = require("../lib/order");
const { log } = require("console");

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
    const symbolToken = parseInt(order?.symbol_token);
    if (!pendingOrderDataEmiter.has(symbolToken)) {
      pendingOrderDataEmiter.set(symbolToken, []);
    }

    if (!pendingOrderExecutor.has(symbolToken)) {
      pendingOrderExecutor.set(symbolToken, [order]);
    } else {
      pendingOrderExecutor.get(symbolToken).push(order);
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

// !! API to manage the order
const placeOrder = async (req, res) => {
  try {
    const order = await placeOrderLib(
      req?.user?.tokenDetails?.unique_token,
      req.body
    );
    await addOrderInMap(order, req?.user?.tokenDetails?.unique_token); // ** Adds newly added order to map
    res.status(200).json({ content: order });
  } catch (error) {
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

const list = async (req, res) => {
  try {
    const result = await listLib(
      req?.user?.tokenDetails?.unique_token,
      req.body
    );
    res.status(200).json({ content: result });
  } catch (error) {
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await cancelOrderLib(
      req?.user?.tokenDetails?.unique_token,
      req.body
    );
    await removeOrderFromMap(order, req?.user?.tokenDetails?.unique_token);
    res.status(200).json({ content: "Cancelled!!!" });
  } catch (error) {
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

// ? Manage Map Variables
async function addOrderInMap(order, user_token) {
  const symbol_token = parseInt(order?.symbol_token);
  const ws = await getWs(user_token);

  if (!pendingOrderDataEmiter.has(symbol_token)) {
    pendingOrderDataEmiter.set(symbol_token, [ws]);
  } else {
    if (ws) {
      const webSockets = pendingOrderDataEmiter?.get(symbol_token);
      if (!isWsExist(webSockets, ws)) {
        pendingOrderDataEmiter?.get(symbol_token)?.push(ws);
      }
    }
  }

  if (!pendingOrderExecutor.has(symbol_token)) {
    pendingOrderExecutor.set(symbol_token, [order]);
  } else {
    pendingOrderExecutor.get(symbol_token).push(order);
  }
}

// ? Remove From Order Map
async function removeOrderFromMap(order, user_token) {
  const symbol_token = parseInt(order?.symbol_token);
  const ws = await getWs(user_token);

  if (ws) {
    let webSockets = pendingOrderDataEmiter?.get(symbol_token);
    webSockets = webSockets.filter(
      (client) => client.unique_token != ws?.unique_token
    );
    pendingOrderDataEmiter?.set(symbol_token, webSockets);
  }

  let orders = pendingOrderExecutor.get(symbol_token);
  orders = orders.filter((object) => object.order_token !== order?.order_token);
  pendingOrderExecutor?.set(symbol_token, orders);
}

function cleanupExecutedOrder() {}

// ? Returns a single WebSocket connection based on the given user_token
async function getWs(user_token) {
  const webSockets = watchlistWS?.clients || [];
  let connection = null;
  for (const ws of webSockets) {
    if (ws.unique_token == user_token) {
      connection = ws;
      break;
    }
  }
  return connection;
}

async function isWsExist(webSockets, newWs) {
  let isExist = false;
  for (const ws of webSockets) {
    if (ws?.unique_token == newWs?.unique_token) {
      isExist = true;
    }
  }

  return isExist;
}

subscribeToTicks(channelData);

init();

module.exports = { placeOrder, list, cancelOrder };
