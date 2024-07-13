module.exports = (sequelize, DataTypes) => {
  const Symbol = sequelize.define(
    "Symbol",
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiry: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      strike: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lotsize: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      instrumenttype: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      exch_seg: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tick_size: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      tableName: "symbols",
    }
  );

  return Symbol;
};
