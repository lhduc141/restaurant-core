import bcrypt from "bcrypt";
import Joi from "joi";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import { createToken } from "../config/jwt.js";
import { ROLE, TABLE_STATUS } from "../constant/enum.js";

const model = initModels(sequelize);

const signupSchema = Joi.object({
  role_id: Joi.number().valid(ROLE.STAFF, ROLE.ADMIN).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).required(),
  quantity: Joi.number().integer().min(1).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const signupService = async (role_id, email, password, name, quantity) => {
  const { error } = signupSchema.validate({ role_id, email, password, name, quantity });
  if (error) {
    return { error: error.details[0].message, status: 400 };
  }

  try {
    const existing = await model.Account.findOne({ where: { email } });
    if (existing) {
      return { error: "Email exists, use another email", status: 400 };
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const account = await model.Account.create({
      roleID: role_id,
      email,
      password: hashedPassword,
    });

    let roleDetails = null;

    if (role_id === ROLE.STAFF) {
      const table = await model.TableEntity.create({
        tabletAccountID: account.accountID,
        tableName: name,
        capacity: quantity || 2,
        status: TABLE_STATUS.VACANT,
      });

      roleDetails = {
        role: "Staff",
        tableID: table.tableID,
        tableName: table.tableName,
        capacity: table.capacity,
      };
    }

    if (role_id === ROLE.ADMIN) {
      const admin = await model.Admin.create({
        accountID: account.accountID,
        adminName: name,
      });

      roleDetails = {
        role: "Admin",
        adminID: admin.adminID,
        adminName: admin.adminName,
      };
    }

    return {
      data: {
        accountID: account.accountID,
        roleID: account.roleID,
        email: account.email,
        roleDetails,
      },
      status: 201,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error creating user", status: 500 };
  }
};

export const loginService = async (email, password) => {
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    return { error: error.details[0].message, status: 400 };
  }

  try {
    const account = await model.Account.findOne({ where: { email } });
    if (!account) {
      return { error: "Incorrect email or password", status: 401 };
    }

    const isValidPassword = bcrypt.compareSync(password, account.password);
    if (!isValidPassword) {
      return { error: "Incorrect email or password", status: 401 };
    }

    let table = null;
    if (account.roleID === ROLE.STAFF) {
      table = await model.TableEntity.findOne({ where: { tabletAccountID: account.accountID } });
    }

    const payload = {
      accountID: account.accountID,
      roleID: account.roleID,
      tableID: table?.tableID || null,
    };

    const accessToken = createToken(payload, "1d");
    return {
      data: {
        accessToken,
        user: payload,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error logging in", status: 500 };
  }
};
