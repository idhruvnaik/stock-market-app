const WebSocket = require("ws");
const db = require("../models/index");
const tokenUtil = require("../utils/tokenUtil");
const url = require("url");

const { subscribeToTicks } = require("../sockets/angel-one");
const constants = require("../config/constants");

const watchlistWS = new WebSocket.Server({ port: constants.SOCKETS.WATCHLIST });
let userObserver = new Map();

async function init() {
  try {
    userObserver = await makeUserList();
  } catch (e) {
    console.log(e);
  }
}

// ? Populate User List
async function makeUserList() {
  const symbols = await db.Symbol.findAll();
  symbols?.forEach((element) => {
    if (!userObserver.has(parseInt(element?.token))) {
      userObserver.set(parseInt(element?.token), []);
    }
  });

  return userObserver;
}

async function channelData(data) {
  try {
    if (data?.token) {
      const cleanedString =
        typeof data?.token === "string"
          ? data.token.replace(/"/g, "")
          : data?.token;
      const integerNumber = parseInt(cleanedString, 10);

      if (userObserver.has(integerNumber)) {
        const clients = userObserver.get(integerNumber);
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
    await updateClientObserver(ws, data);

    ws.on("close", () => {
      console.log("Closed......");
    });
  } catch (error) {
    ws.send(JSON.stringify({ error: "Unauthorized" }));
    ws.close(1002, "Unauthorized");
    return;
  }
});

async function updateClientObserver(ws, data) {
  let tokens = await db.UserWatchList.findAll({
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

// ? Update Client Observer <> After Add Operation
async function addInClientObserver(user_token, symbol_token) {
  symbol = parseInt(symbol_token);
  if (userObserver.has(symbol)) {
    const ws = await findClientByUniqueToken(user_token);
    if (ws) {
      userObserver.get(symbol).push(ws);
    }
  }
}

// ? Update Client Observer <> After Remove Operation
async function removeInClientObserver(user_token, symbol_token) {
  symbol = parseInt(symbol_token);
  if (userObserver.has(symbol)) {
    const ws = await findClientByUniqueToken(user_token);
    if (ws) {
      let clients = userObserver?.get(symbol);
      if (clients) {
        clients = clients.filter((client) => client !== ws);
        userObserver.set(symbol, clients);
      }
    }
  }
}

// ? Finds the webscoket client.
function findClientByUniqueToken(unique_token) {
  for (const ws of watchlistWS.clients) {
    if (ws.unique_token === unique_token) {
      return ws;
    }
  }
  return null;
}

const add = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const { symbol, symbol_token, symbol_raw_data } = req?.body;

    const object = await db.UserWatchList.create({
      user_token: unique_token,
      symbol: symbol,
      symbol_token: symbol_token,
      symbol_raw_data: symbol_raw_data,
    });

    await addInClientObserver(unique_token, object?.symbol_token);
    res.status(200).json({ symbol: object });
  } catch (error) {
    message = "";
    if (error?.name == "SequelizeUniqueConstraintError") {
      message = "Item Already Exist!!";
    }
    res.status(400).json({ message: message || "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const unique_token = req?.user?.tokenDetails?.unique_token;
    const { symbol, symbol_token } = req?.body;

    await db.UserWatchList.destroy({
      where: {
        user_token: unique_token,
        symbol: symbol,
        symbol_token: symbol_token,
      },
    });

    await removeInClientObserver(unique_token, symbol_token);
    res.status(200).json({ message: "Deleted Successfuly!!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

subscribeToTicks(channelData);

module.exports = {
  init,
  addInClientObserver,
  removeInClientObserver,
  add,
  remove,
};
init();
