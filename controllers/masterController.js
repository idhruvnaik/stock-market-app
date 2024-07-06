const symbols = async (_, res) => {
    try {
      console.log("Fetching........");
      const response = await fetch('https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json');
      console.log("Fetching Done........");

      console.log("Formatting........");
      let symbols = await response.json();
      console.log("Formatting Done........");
      
      console.log("Filtering........");
      const filteredSymbols = symbols.filter(filterSymbol);
      console.log("Filtering Done........");

      res.status(200).json(filteredSymbols);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const filterSymbol = (symbol) => symbol.exch_seg == 'NFO' && symbol.instrumenttype == 'FUTSTK'

module.exports = { symbols }