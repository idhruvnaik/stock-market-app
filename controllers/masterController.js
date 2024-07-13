var LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./storage");
const symbol = require("../utils/symbolUtil");

const symbols = async (_, res) => {
  const symbolsListOrError = await symbol.getFilteredSymbolList();
  if (Array.isArray(symbolsListOrError)) {
    res.status(200).json({ symbols: symbolsListOrError });
  } else {
    res.status(500).json({ message: symbolsListOrError });
  }
};

module.exports = { symbols };
