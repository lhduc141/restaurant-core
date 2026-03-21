import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Account from  "./Account.js";
import _Admin from  "./Admin.js";
import _Choose from  "./Choose.js";
import _Customer from  "./Customer.js";
import _Menu_Item from  "./Menu_Item.js";
import _Order from  "./Order.js";
import _Role from  "./Role.js";
import _TableEntity from  "./TableEntity.js";
import _Transaction from  "./Transaction.js";

export default function initModels(sequelize) {
  const Account = _Account.init(sequelize, DataTypes);
  const Admin = _Admin.init(sequelize, DataTypes);
  const Choose = _Choose.init(sequelize, DataTypes);
  const Customer = _Customer.init(sequelize, DataTypes);
  const Menu_Item = _Menu_Item.init(sequelize, DataTypes);
  const Order = _Order.init(sequelize, DataTypes);
  const Role = _Role.init(sequelize, DataTypes);
  const TableEntity = _TableEntity.init(sequelize, DataTypes);
  const Transaction = _Transaction.init(sequelize, DataTypes);

  Admin.belongsTo(Account, { as: "user", foreignKey: "userID"});
  Account.hasMany(Admin, { as: "Admins", foreignKey: "userID"});
  TableEntity.belongsTo(Account, { as: "user", foreignKey: "userID"});
  Account.hasMany(TableEntity, { as: "TableEntities", foreignKey: "userID"});
  Order.belongsTo(Choose, { as: "choose", foreignKey: "chooseID"});
  Choose.hasMany(Order, { as: "Orders", foreignKey: "chooseID"});
  Choose.belongsTo(Customer, { as: "customer", foreignKey: "customerID"});
  Customer.hasMany(Choose, { as: "Chooses", foreignKey: "customerID"});
  Transaction.belongsTo(Customer, { as: "customer", foreignKey: "customerID"});
  Customer.hasMany(Transaction, { as: "Transactions", foreignKey: "customerID"});
  Choose.belongsTo(Menu_Item, { as: "item", foreignKey: "itemID"});
  Menu_Item.hasMany(Choose, { as: "Chooses", foreignKey: "itemID"});
  Account.belongsTo(Role, { as: "role", foreignKey: "roleID"});
  Role.hasMany(Account, { as: "Accounts", foreignKey: "roleID"});
  Customer.belongsTo(TableEntity, { as: "table", foreignKey: "tableID"});
  TableEntity.hasMany(Customer, { as: "Customers", foreignKey: "tableID"});
  Order.belongsTo(Transaction, { as: "transaction", foreignKey: "transactionID"});
  Transaction.hasMany(Order, { as: "Orders", foreignKey: "transactionID"});

  return {
    Account,
    Admin,
    Choose,
    Customer,
    Menu_Item,
    Order,
    Role,
    TableEntity,
    Transaction,
  };
}
