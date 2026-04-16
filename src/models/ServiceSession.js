import Sequelize from 'sequelize';
const { DataTypes } = Sequelize;

export default function(sequelize) {
  return sequelize.define('ServiceSession', {
    sessionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tableID: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.STRING(20),
      allowNull: true
    },
    guestCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('OPEN','PAID','CLOSED'),
      allowNull: true,
      defaultValue: "OPEN"
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ServiceSession',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sessionID" },
        ]
      },
      {
        name: "idx_tableID",
        using: "BTREE",
        fields: [
          { name: "tableID" },
        ]
      },
      {
        name: "idx_ServiceSession_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
    ]
  });
}