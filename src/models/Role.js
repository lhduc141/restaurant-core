import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Role extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    roleID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    roleName: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    ]
  });
  }
}
