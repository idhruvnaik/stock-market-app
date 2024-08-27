const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");
const constants = require("../config/constants");
const { subscribeToTicks } = require("./angel-one");
const { v4: uuidv4 } = require("uuid");

const {
  placeOrderLib,
  listLib,
  cancelOrderLib,
  updateOrderLib,
} = require("../lib/order/pending");

let pendingOrderDataEmiter = new Map();
let pendingOrderExecutor = new Map();

const watchlistWS = new WebSocket.Server({
  port: constants.SOCKETS.PENDING_ORDER,
});

watchlistWS.on("connection", async (ws, req) => {
  const location = url.parse(req.url, true);
  const token = location.query.token;

  try {
    const data = await tokenUtil?.verifyAccessToken(token);
    if (data?.tokenDetails?.unique_token) {
      ws.unique_token = data?.tokenDetails?.unique_token;
      ws.id = generateUniqueToken();
    } else {
      ws.close(1002, "Unauthorized");
    }
    await updatePendingOrderData(ws, data);

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
    pendingOrderDataEmiter = await pendingOrders();
  } catch (e) {
    console.log(e);
  }
}

// ? Pending Order List
async function pendingOrders() {
  try {
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
  } catch (error) {
    throw error;
  }
}

async function channelData(data) {
  try {
    if (data?.token) {
      const cleanedString =
        typeof data?.token === "string"
          ? data.token.replace(/"/g, "")
          : data?.token;
      const symbolToken = parseInt(cleanedString, 10);

      sendDataToClient(symbolToken, data);
      monitorUserOrders(symbolToken, data);
    }
  } catch (e) {
    throw e;
  }
}

// ? Adds WebSocket connections to the map when a new connection is established
async function updatePendingOrderData(ws, data) {
  try {
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
  } catch (error) {
    throw error;
  }
}

// ? Data Sender Functions()
async function sendDataToClient(integerNumber, data) {
  try {
    if (pendingOrderDataEmiter.has(integerNumber)) {
      const clients = pendingOrderDataEmiter.get(integerNumber);

      if (clients.length > 0) {
        clients?.forEach((wsClient) => {
          data.token = integerNumber || data?.token;
          wsClient.send(JSON.stringify(data));
        });
      }
    }
  } catch (error) {}
}

async function monitorUserOrders(integerNumber, data) {
  try {
    if (pendingOrderExecutor.has(integerNumber)) {
      const orders = await pendingOrderExecutor.get(integerNumber);
      for (const order of orders) {
        const last_traded_price = (
          parseFloat(data?.last_traded_price) / 100
        ).toFixed(2);

        if (order?.user_token == "69c0b14e-bb04-433f-b916-15ca4a76a835") {
          console.log(last_traded_price);
          console.log(order?.reference_price);
        }

        if (
          (last_traded_price <= order?.reference_price &&
            order?.state == constants.ORDER.STATE.BUY) ||
          (last_traded_price >= order?.reference_price &&
            order?.state == constants.ORDER.STATE.SELL)
        ) {
          await executeUserOrder(order, last_traded_price);
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

async function executeUserOrder(order, price) {
  try {
    if (order) {
      await order.update({ trigger_price: price });
      await removeOrderFromMap(order, order?.user_token);
      const ws = await getWs(order?.user_token);
      if (ws) {
        ws.send(
          JSON.stringify({
            order_token: order?.order_token,
            status: order?.status,
            mode: order?.mode,
            state: order?.state,
          })
        );
      }
    }
  } catch (error) {
    throw error;
  }
}

// !! API to manage the order
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

const updateOrder = async (req, res) => {
  try {
    const order = await updateOrderLib(req.body);
    if (
      order?.status == constants.ORDER.STATUS.PENDING &&
      order?.mode == constants.ORDER.MODE.MARKET
    ) {
      await updateOrderMap(order);
    }

    res.status(200).json({ content: order });
  } catch (error) {
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

const placeOrder = async (req, res) => {
  try {
    const order = await placeOrderLib(
      req?.user?.tokenDetails?.unique_token,
      req.body
    );

    if (order?.mode == constants.ORDER.MODE.LIMIT) {
      await addOrderInMap(order, req?.user?.tokenDetails?.unique_token); // ** Adds newly added order to map
    }

    res.status(200).json({ content: order });
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

// !! Map modifier methods

// ? Add to Order Map
async function addOrderInMap(order, user_token) {
  try {
    const symbol_token = parseInt(order?.symbol_token);
    const ws = await getWs(user_token);

    if (ws) {
      if (
        !pendingOrderDataEmiter.has(symbol_token) ||
        (pendingOrderDataEmiter.has(symbol_token) &&
          pendingOrderDataEmiter.get(symbol_token).length == 0)
      ) {
        pendingOrderDataEmiter.set(symbol_token, [ws]);
      } else {
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
  } catch (error) {
    throw error;
  }
}

// ? Remove From Order Map
async function removeOrderFromMap(order, user_token) {
  try {
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
    orders = orders.filter(
      (object) => object.order_token !== order?.order_token
    );
    pendingOrderExecutor?.set(symbol_token, orders);
  } catch (error) {
    throw error;
  }
}

// ? Update Order Map
async function updateOrderMap(order, user_token) {
  try {
    const symbol_token = parseInt(order?.symbol_token);
    let orders = pendingOrderExecutor.get(symbol_token);

    if (orders.length > 0) {
      orders = orders?.filter(
        (object) => object.order_token !== order?.order_token
      );

      orders.push(order);
      pendingOrderExecutor?.set(symbol_token, orders);
    }
  } catch (error) {
    throw error;
  }
}

// ? Returns a single WebSocket connection based on the given user_token
async function getWs(user_token) {
  try {
    const webSockets = watchlistWS?.clients || [];
    let connection = null;
    for (const ws of webSockets) {
      if (ws.unique_token == user_token) {
        connection = ws;
        break;
      }
    }
    return connection;
  } catch (error) {
    throw error;
  }
}

// ? Checks if a particular client exists in WebSocket clients
async function isWsExist(webSockets, newWs) {
  try {
    let isExist = false;
    for (const ws of webSockets) {
      if (ws?.id == newWs?.id) {
        isExist = true;
      }
    }

    return isExist;
  } catch (error) {
    throw error;
  }
}

// Function to remove WebSocket from the map
async function removeWebSocket(ws) {
  for (const [token, sockets] of pendingOrderDataEmiter) {
    const updatedSockets = sockets.filter((socket) => socket.id !== ws.id);

    if (updatedSockets.length !== sockets.length) {
      pendingOrderDataEmiter.set(token, updatedSockets);
    }
  }
}

function generateUniqueToken() {
  const uuid = uuidv4();
  const timestamp = Date.now().toString(36);
  return `${uuid}-${timestamp}`;
}

subscribeToTicks(channelData);

init();

module.exports = { placeOrder, list, cancelOrder, updateOrder };
