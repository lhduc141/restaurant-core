import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('Admin', {
    adminID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    accountID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Account',
        key: 'accountID'
      },
      unique: "fk_Admin_Account"
    },
    adminName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Admin',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "adminID" },
        ]
      },
      {
        name: "accountID",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "accountID" },
        ]
      },
      {
        name: "idx_accountID",
        using: "BTREE",
        fields: [
          { name: "accountID" },
        ]
      },
    ]
  });
}