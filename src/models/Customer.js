import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Customer extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    customerID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tableID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'TableEntity',
        key: 'tableID'
      }
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Customer',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "customerID" },
        ]
      },
      {
        name: "tableID",
        using: "BTREE",
        fields: [
          { name: "tableID" },
        ]
      },
    ]
  });
  }
}
