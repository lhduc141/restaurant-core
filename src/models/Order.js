import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('Order', {
    orderID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sessionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ServiceSession',
        key: 'sessionID'
      }
    },
    orderNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    orderedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    status: {
      type: DataTypes.ENUM('NEW','SENT_TO_KITCHEN','COMPLETED','CANCELLED'),
      allowNull: true,
      defaultValue: "NEW"
    }
  }, {
    sequelize,
    tableName: 'Order',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "orderID" },
        ]
      },
      {
        name: "uq_sessionID_orderNumber",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sessionID" },
          { name: "orderNumber" },
        ]
      },
      {
        name: "idx_sessionID",
        using: "BTREE",
        fields: [
          { name: "sessionID" },
        ]
      },
      {
        name: "idx_Order_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
}