module.exports = {
  ORDER: {
    STATUS: {
      PENDING: "PENDING",
      SUCCESS: "SUCCESS",
      CANCEL: "CANCEL",
    },
    STATE: {
      BUY: "BUY",
      SELL: "SELL",
      NA: "NA",
    },
    MODE: {
      MARKET: "MARKET",
      LIMIT: "LIMIT",
    },
  },
  EXCHANGES: {
    NSE: "NSE",
    NFO: "NFO",
  },
  SOCKETS: {
    WATCHLIST: 8080,
    PENDING_ORDER: 8081,
    SUCCESS_ORDER: 8082,
  },
  ROLE: {
    ADMIN: "ADMIN",
    CLIENT: "CLIENT",
  },
  USER: {
    STATUS: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
  },
};
