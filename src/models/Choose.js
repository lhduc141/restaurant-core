import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Choose extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    chooseID: {
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
    itemID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Menu_Item',
        key: 'itemID'
      }
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'Choose',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "chooseID" },
        ]
      },
      {
        name: "customerID",
        using: "BTREE",
        fields: [
          { name: "customerID" },
        ]
      },
      {
        name: "itemID",
        using: "BTREE",
        fields: [
          { name: "itemID" },
        ]
      },
    ]
  });
  }
}
