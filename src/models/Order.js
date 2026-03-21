import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Order extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    orderID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    transactionID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Transaction',
        key: 'transactionID'
      }
    },
    chooseID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Choose',
        key: 'chooseID'
      }
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
        name: "transactionID",
        using: "BTREE",
        fields: [
          { name: "transactionID" },
        ]
      },
      {
        name: "chooseID",
        using: "BTREE",
        fields: [
          { name: "chooseID" },
        ]
      },
    ]
  });
  }
}
