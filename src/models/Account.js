import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('Account', {
    accountID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    roleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Role',
        key: 'roleID'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'Account',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "accountID" },
        ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "idx_roleID",
        using: "BTREE",
        fields: [
          { name: "roleID" },
        ]
      },
    ]
  });
}