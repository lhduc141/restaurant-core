import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('OrderItem', {
    orderItemID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    orderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Order',
        key: 'orderID'
      }
    },
    itemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'MenuItem',
        key: 'itemID'
      }
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lineTotal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    isCancelled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('ORDERED','PREPARING','IN_PROGRESS','SERVED','CANCELLED'),
      allowNull: true,
      defaultValue: "ORDERED"
    }
  }, {
    sequelize,
    tableName: 'OrderItem',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "orderItemID" },
        ]
      },
      {
        name: "idx_orderID",
        using: "BTREE",
        fields: [
          { name: "orderID" },
        ]
      },
      {
        name: "idx_itemID",
        using: "BTREE",
        fields: [
          { name: "itemID" },
        ]
      },
      {
        name: "idx_OrderItem_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
}