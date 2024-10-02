const db = require("../models");
const moment = require("moment");
const constants = require("../config/constants");

const todayDate = moment().format("YYYY-MM-DD");

const importSymbols = async (req, res) => {
  try {
    const t = await db.sequelize.transaction();
    db.Symbol.destroy({ truncate: true }); // ? Clean Up

    const response = await fetch(
      "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"
    );

    const allSymbols = await response.json();
    const filteredSymbols = allSymbols.filter(isFUTSymbol);

    filteredSymbols?.forEach(async (element) => {
      if (element && isTokenExpired(element?.expiry)) {
        const tick_size = parseFloat(element?.tick_size) || 0;
        const lotsize = parseFloat(element?.lotsize) || 0;

        if (tick_size && lotsize) {
          await db.Symbol.create({
            token: element?.token,
            symbol: element?.symbol,
            name: element?.name,
            expiry: element?.expiry,
            strike: element?.strike,
            lotsize: lotsize,
            instrumenttype: element?.instrumenttype,
            exch_seg: element?.exch_seg,
            tick_size: tick_size,
          });
        }
      }
    });

    await t.commit();
    console.log("Transaction has been committed successfully");

    res.status(200).json({ message: "Saved!!" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

const removeExpiredSymbolsFromWatchlist = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const watchList = await db.UserWatchList.findAll({
      include: {
        model: db.Symbol,
        as: "masterSymbol",
        required: true,
      },
    });

    watchList?.forEach(async (element) => {
      var date = moment(element?.masterSymbol?.expiry, "DDMMMYYYY").format(
        "YYYY-MM-DD"
      );

      if (date && date < todayDate) {
        await element.destroy();
      }
    });

    await t.commit();
    console.log("Transaction has been committed successfully");
    res.status(200).json({ message: "Done!!!" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

const removeExpiredSymbolsFromPendingOrders = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const orders = await db.UserOrder.findAll({
      where: {
        status: constants.ORDER.STATUS.PENDING,
      },
      include: {
        model: db.Symbol,
        as: "masterSymbol",
        required: true,
      },
    });

    orders?.forEach(async (order) => {
      var date = moment(order?.masterSymbol?.expiry, "DDMMMYYYY").format(
        "YYYY-MM-DD"
      );

      if (date && date < todayDate) {
        await order.destroy();
      }
    });

    await t.commit();
    console.log("Transaction has been committed successfully");
    res.status(200).json({ message: "Done!!!" });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res
      .status(error?.code || 500)
      .json({ message: error?.message || "Sorry!! Something went wrong." });
  }
};

const isTokenExpired = (date) => {
  const parsedDate = moment(date, "DDMMMYYYY");
  const currentDate = moment();

  return parsedDate.isSameOrAfter(currentDate);
};

const isFUTSymbol = (symbol) =>
  symbol.exch_seg == "NFO" && symbol.instrumenttype == "FUTSTK";

module.exports = {
  importSymbols,
  removeExpiredSymbolsFromWatchlist,
  removeExpiredSymbolsFromPendingOrders,
};
