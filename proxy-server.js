const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const otplib = require("otplib");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ port: 8080 });

let { SmartAPI, WebSocketV2 } = require("smartapi-javascript");
const { log } = require("console");

let smart_api = new SmartAPI({ api_key: "t7slrOfp" });
const token = otplib.authenticator.generate("KAKY5PKI5H6EXA5IUMSFEFYRR4");
let socket = {};

var increment = 0;
let users = [];
wss.on("connection", (ws) => {
  const clientId = uuidv4(); // Generate a unique identifier
  ws.clientId = "XYZ11" + increment; // Attach the ID to the WebSocket object
  increment += 1;
  users.push(ws);
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    // const data = JSON.parse(message);
    // const userId = data.userId;

    // if (data.action === "subscribe") {
    //   if (!users.has(userId)) {
    //     users.set(userId, { ws, stocks: new Set() });
    //   }
    //   users.get(userId).stocks.add(data.stock);
    // } else if (data.action === "unsubscribe") {
    //   if (users.has(userId)) {
    //     users.get(userId).stocks.delete(data.stock);
    //   }
    // }
  });

  ws.on("close", () => {});
});

Promise.bind(
  smart_api.generateSession("D309388", "9586", token).then((auth) => {
    socket = new WebSocketV2({
      jwttoken: auth?.data?.jwtToken,
      apikey: "t7slrOfp",
      clientcode: "D309388",
      feedtype: auth?.data?.feedToken,
    });

    try {
      socket.connect().then((data) => {
        let json_req = {
          correlationID: "correlation_id",
          action: 1,
          mode: 1,
          exchangeType: 2,
          tokens: ["10666", "10133"],
          params: 1,
        };

        socket.fetchData(json_req);
        socket.on("tick", receiveTick);

        function receiveTick(data) {
          console.log(data);
        }
      });
    } catch (e) {
      console.log(e);
    }
  })
);

setInterval(() => {
  console.log(`Number of active connections: ${wss.clients.size}`);
  wss?.clients?.forEach((ws) => {
    console.log();
    if (ws.clientId == "XYZ110") {
      ws.send(
        JSON.stringify({
          stock: "AAPL",
          data: {},
          additionalData: "Empty",
        })
      );
    }
  });
}, 5000);

// socket.close();
