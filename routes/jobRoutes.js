const express = require("express");
const {
  importSymbols,
  removeExpiredSymbolsFromWatchlist,
  removeExpiredSymbolsFromPendingOrders,
} = require("../controllers/jobsController");

const router = express.Router();

router.post("/import_symbols", importSymbols);

router.post(
  "/remove_expired_symbols_from_watchlists",
  removeExpiredSymbolsFromWatchlist
);

router.post(
  "/remove_expired_symbols_from_orders",
  removeExpiredSymbolsFromPendingOrders
);

module.exports = router;
