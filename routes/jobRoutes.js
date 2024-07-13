const express = require("express");
const { importSymbols } = require("../controllers/jobsController");

const router = express.Router();

router.post("/import_symbols", importSymbols);

module.exports = router;
