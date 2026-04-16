import { DataTypes } from "sequelize";
import _Account from "./Account.js";
import _Admin from "./Admin.js";
import _MenuItem from "./MenuItem.js";
import _Order from "./Order.js";
import _OrderItem from "./OrderItem.js";
import _Role from "./Role.js";
import _ServiceSession from "./ServiceSession.js";
import _TableEntity from "./TableEntity.js";
import _Transaction from "./Transaction.js";

function initModels(sequelize) {
  var Account = _Account(sequelize, DataTypes);
  var Admin = _Admin(sequelize, DataTypes);
  var MenuItem = _MenuItem(sequelize, DataTypes);
  var Order = _Order(sequelize, DataTypes);
  var OrderItem = _OrderItem(sequelize, DataTypes);
  var Role = _Role(sequelize, DataTypes);
  var ServiceSession = _ServiceSession(sequelize, DataTypes);
  var TableEntity = _TableEntity(sequelize, DataTypes);
  var Transaction = _Transaction(sequelize, DataTypes);

  Admin.belongsTo(Account, { as: "account", foreignKey: "accountID"});
  Account.hasOne(Admin, { as: "Admin", foreignKey: "accountID"});
  TableEntity.belongsTo(Account, { as: "tabletAccount", foreignKey: "tabletAccountID"});
  Account.hasMany(TableEntity, { as: "TableEntities", foreignKey: "tabletAccountID"});
  OrderItem.belongsTo(MenuItem, { as: "item", foreignKey: "itemID"});
  MenuItem.hasMany(OrderItem, { as: "OrderItems", foreignKey: "itemID"});
  OrderItem.belongsTo(Order, { as: "order", foreignKey: "orderID"});
  Order.hasMany(OrderItem, { as: "OrderItems", foreignKey: "orderID"});
  Account.belongsTo(Role, { as: "role", foreignKey: "roleID"});
  Role.hasMany(Account, { as: "Accounts", foreignKey: "roleID"});
  Order.belongsTo(ServiceSession, { as: "session", foreignKey: "sessionID"});
  ServiceSession.hasMany(Order, { as: "Orders", foreignKey: "sessionID"});
  Transaction.belongsTo(ServiceSession, { as: "session", foreignKey: "sessionID"});
  ServiceSession.hasMany(Transaction, { as: "Transactions", foreignKey: "sessionID"});
  ServiceSession.belongsTo(TableEntity, { as: "table", foreignKey: "tableID"});
  TableEntity.hasMany(ServiceSession, { as: "ServiceSessions", foreignKey: "tableID"});

  return {
    Account,
    Admin,
    MenuItem,
    Order,
    OrderItem,
    Role,
    ServiceSession,
    TableEntity,
    Transaction,
  };
}

export default initModels;