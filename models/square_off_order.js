module.exports = (sequelize, DataTypes) => {
  const SquareOffOrder = sequelize.define("square_off_orders", {
    user_order_token: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "user_orders",
        key: "order_token",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "CANCEL"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    mode: {
      type: DataTypes.ENUM("LIMIT", "MARKET", "NA"),
      allowNull: false,
      defaultValue: "NA",
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  });

  SquareOffOrder.associate = (models) => {
    SquareOffOrder.belongsTo(models.UserOrder, {
      foreignKey: "user_order_token",
      as: "user_orders",
      sourceKey: "order_token",
    });
  };

  return SquareOffOrder;
};
