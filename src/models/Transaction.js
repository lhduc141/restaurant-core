import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Transaction extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    transactionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    customerID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Customer',
        key: 'customerID'
      }
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    feedback: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Transaction',
    timestamps: false,
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
        name: "customerID",
        using: "BTREE",
        fields: [
          { name: "customerID" },
        ]
      },
    ]
  });
  }
}
