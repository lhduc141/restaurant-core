import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('Transaction', {
    transactionID: {
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
    paymentMethod: {
      type: DataTypes.ENUM('CASH','CARD','TRANSFER','OTHER'),
      allowNull: true,
      defaultValue: "CASH"
    },
    paymentStatus: {
      type: DataTypes.ENUM('PENDING','PAID','CANCELLED'),
      allowNull: true,
      defaultValue: "PENDING"
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    feedback: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Transaction',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "transactionID" },
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
        name: "idx_Transaction_paymentStatus",
        using: "BTREE",
        fields: [
          { name: "paymentStatus" },
        ]
      },
    ]
  });
}