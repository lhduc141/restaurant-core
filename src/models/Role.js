import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('Role', {
    roleID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    roleName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "roleName"
    }
  }, {
    sequelize,
    tableName: 'Role',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "roleID" },
        ]
      },
      {
        name: "roleName",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "roleName" },
        ]
      },
    ]
  });
}