import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Menu_Item extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    itemID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type_of_food: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    descriptions: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    preparation_time: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Menu_Item',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "itemID" },
        ]
      },
    ]
  });
  }
}
