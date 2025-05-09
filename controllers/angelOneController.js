const { ltpData, authorize, holiday } = require("../lib/angel-one");

const getLtpofTokens = async (req, res) => {
  try {
    await authorize();
    const result = await ltpData(req.body.nfo_symbols);
    res.status(200).json({ result: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const fetchHoliday = async (req, res) => {
  try {
    const result = await holiday();
    res.status(200).json({ result: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getLtpofTokens, fetchHoliday };
