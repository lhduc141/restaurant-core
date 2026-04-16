import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('MenuItem', {
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
    typeOfFood: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    descriptions: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'MenuItem',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "itemID" },
        ]
      },
      {
        name: "idx_MenuItem_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
}