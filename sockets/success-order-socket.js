const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");
const constants = require("../config/constants");
const { subscribeToTicks } = require("./angel-one");
const { v4: uuidv4 } = require("uuid");

const { squareOffOrderLib } = require("../lib/order/success");

let successOrderDataEmitter = new Map();
let successOrderExecutor = new Map();

const watchlistWS = new WebSocket.Server({
  port: constants.SOCKETS.SUCCESS_ORDER,
});

watchlistWS.on("connection", async (ws, req) => {
  const location = url.parse(req.url, true);
  const token = location?.query?.token;

  try {
    const data = await tokenUtil?.verifyAccessToken(token);
    if (data?.tokenDetails?.unique_token) {
      ws.unique_token = data?.tokenDetails?.unique_token;
      ws.id = generateUniqueToken();
      await updateSuccessOrderDataEmitter(ws, data);
    } else {
      ws.close(1002, "Unauthorized");
    }

    ws.on("close", async (code) => {
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
    successOrderExecutor = await pendingOrders();
  } catch (e) {
    console.log(e);
  }
}

// ? Pending Order List
async function updateSuccessOrderDataEmitter(ws, data) {
  try {
    let tokens = await db.SquareOffOrder.findAll({
      where: { status: constants.ORDER.STATUS.PENDING },
      attributes: [
        [db.Sequelize.col("user_order.symbol_token"), "symbol_token"],
      ],
      include: [
        {
          model: db.UserOrder,
          as: "user_order",
          where: {
            user_token: data["tokenDetails"]["unique_token"],
          },
          attributes: [],
          required: true,
        },
      ],
      raw: true,
    });

    tokens = [...new Set(tokens.map((item) => item.symbol_token))];
    tokens?.forEach((token) => {
      if (successOrderDataEmitter.has(parseInt(token))) {
        successOrderDataEmitter.get(parseInt(token)).push(ws);
      }
    });
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
    monitorUserOrders(symbolToken, data);
  }
}

function generateUniqueToken() {
  const uuid = uuidv4();
  const timestamp = Date.now().toString(36);
  return `${uuid}-${timestamp}`;
}

// ? Pending Order List
async function pendingOrders() {
  try {
    const orders = await db.SquareOffOrder.findAll({
      where: { status: constants.ORDER.STATUS.PENDING },
      include: [{ model: db.UserOrder, as: "user_order" }],
    });

    for (const order of orders) {
      const user_order = order?.user_order;
      if (user_order) {
        const symbolToken = parseInt(user_order?.symbol_token);

        if (!successOrderDataEmitter.has(symbolToken)) {
          successOrderDataEmitter.set(symbolToken, []);
        }

        if (!successOrderExecutor.has(symbolToken)) {
          successOrderExecutor.set(symbolToken, [order]);
        } else {
          successOrderExecutor.get(symbolToken).push(order);
        }
      }
    }

    return successOrderExecutor;
  } catch (error) {
    throw error;
  }
}

const squareOffOrder = async (req, res) => {
  try {
    const order = await squareOffOrderLib(
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

async function monitorUserOrders(integerNumber, data) {
  try {
    if (successOrderExecutor.has(integerNumber)) {
      const orders = await successOrderExecutor.get(integerNumber);
      for (const order of orders) {
        const last_traded_price = (
          parseFloat(data?.last_traded_price) / 100
        ).toFixed(2);

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

// !! Function to remove WebSocket from the map
async function removeWebSocket(ws) {
  for (const [token, sockets] of successOrderDataEmitter) {
    const updatedSockets = sockets?.filter((socket) => socket.id !== ws.id);

    if (updatedSockets?.length !== sockets?.length) {
      successOrderDataEmitter.set(token, updatedSockets);
    }
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

// !! Map modifier methods

// ? Add to Order Map
async function addOrderInMap(order, user_token) {
  try {
    const user_order = order?.user_order;
    const symbol_token = parseInt(user_order?.symbol_token);
    const ws = await getWs(user_token);

    if (ws) {
      if (
        !successOrderDataEmitter.has(symbol_token) ||
        (successOrderDataEmitter.has(symbol_token) &&
          successOrderDataEmitter.get(symbol_token).length == 0)
      ) {
        successOrderDataEmitter.set(symbol_token, [ws]);
      } else {
        const webSockets = successOrderDataEmitter?.get(symbol_token);
        if (!isWsExist(webSockets, ws)) {
          successOrderDataEmitter?.get(symbol_token)?.push(ws);
        }
      }
    }

    if (!successOrderExecutor.has(symbol_token)) {
      successOrderExecutor.set(symbol_token, [order]);
    } else {
      successOrderExecutor.get(symbol_token).push(order);
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
      let webSockets = successOrderDataEmitter?.get(symbol_token);
      webSockets = webSockets.filter(
        (client) => client.unique_token != ws?.unique_token
      );
      successOrderDataEmitter?.set(symbol_token, webSockets);
    }

    let orders = successOrderExecutor.get(symbol_token);
    orders = orders.filter(
      (object) => object.order_token !== order?.order_token
    );
    successOrderExecutor?.set(symbol_token, orders);
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

subscribeToTicks(channelData);

init();

module.exports = { squareOffOrder };
