const symbols = async (_, res) => {
    try {
      const response = await fetch('https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json')
      const allSymbols = await response.json();
      const filteredSymbols = allSymbols.filter(isFUTSymbol)
      console.log(filteredSymbols.length)
      res.status(200).json(filteredSymbols);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const isFUTSymbol = (symbol) => symbol.exch_seg == 'NFO' && symbol.instrumenttype == 'FUTSTK'

module.exports = { symbols }