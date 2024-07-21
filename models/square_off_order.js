module.exports = (sequelize, DataTypes) => {
  const SquareOffOrder = sequelize.define("square_off_orders", {
    user_order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user_orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "cancel"),
      allowNull: false,
      defaultValue: "pending",
    },
    mode: {
      type: DataTypes.ENUM("limit", "market", "NA"),
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
      foreignKey: "user_order_id",
      as: "user_orders",
      sourceKey: "id",
    });
  };

  return SquareOffOrder;
};
