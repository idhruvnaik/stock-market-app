const getFilteredSymbolList = async () => {
  try {
    const symbolsData = JSON.parse(localStorage.getItem("symbols"));
    const now = new Date();
    const lastUpdatedDateTime = new Date(
      localStorage.getItem("lastUpdated") || "2000"
    );
    const todaysUpdateDateTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      3,
      30
    );
    if (symbolsData && lastUpdatedDateTime > todaysUpdateDateTime) {
      return symbolsData;
    } else {
      const response = await fetch(
        "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"
      );
      const allSymbols = await response.json();
      const filteredSymbols = allSymbols.filter(isFUTSymbol);
      localStorage.setItem("symbols", JSON.stringify(filteredSymbols));
      localStorage.setItem("lastUpdated", new Date().toISOString());
      return filteredSymbols;
    }
  } catch (error) {
    return error.message;
  }
};

const isFUTSymbol = (symbol) =>
  (symbol.exch_seg == "NFO" && symbol.instrumenttype == "FUTSTK") || (symbol.exch_seg == "MCX" && symbol.instrumenttype == "FUTCOM");

module.exports = { getFilteredSymbolList, isFUTSymbol };
