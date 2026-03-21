import bcrypt from "bcrypt";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {
  checkRefToken,
  checkToken,
  createRefToken,
  createToken,
  decodeToken,
} from "../config/jwt.js";
import Joi from "joi";

let model = initModels(sequelize);

export const signupService = async (
  role_id,
  email,
  password,
  name,
  quantity
) => {
  try {
    let check_user = await model.Account.findOne({
      where: { email },
    });

    if (check_user) {
      return { error: "Email exists, use another email", status: 400 };
    }

    let hashedPassword = bcrypt.hashSync(password, 10);
    let newUser = await model.Account.create({
      roleID: role_id,
      email,
      password: hashedPassword,
    });

    let roleDetails = null;

    switch (role_id) {
      case 1: // Table
        const table = await model.TableEntity.create({
          userID: newUser.userID,
          tableName: name,
          quantity: quantity,
          status: 0,
        });
        roleDetails = {
          role: "Table",
          tableName: table.tableName,
          quantity: table.quantity,
        };
        break;
      case 2: // Admin
        const admin = await model.Admin.create({
          userID: newUser.userID,
          adminName: name,
        });
        roleDetails = {
          role: "Admin",
          adminName: admin.adminName,
        };
        break;
    }

    return {
      data: {
        userID: newUser.userID,
        roleID: newUser.roleID,
        email: newUser.email,
        role_details: roleDetails,
      },
      status: 200,
    };
  } catch (error) {
    console.error(error);
    return { error: "Error creating user", status: 500 };
  }
};

export const loginService = async (email, password) => {
  // const schema = Joi.object({
  //   email: Joi.string().email().required().messages({
  //     "string.email": "Invalid email format",
  //     "any.required": "Email is required",
  //   }),

  //   password: Joi.string().min(8).required().messages({
  //     "string.min": "Password must be at least 8 characters long",
  //     "any.required": "Password is required",
  //   }),
  // });
  // Validate the input
  // const { error } = schema.validate({ email, password });

  // if (error) {
  //   return { error: error.details[0].message, status: 400 };
  // }
  try {
    let check_user = await model.Account.findOne({
      where: { email },
    });

    if (!check_user) {
      return { error: "Incorrect email or password", status: 400 };
    }

    if (check_user && bcrypt.compareSync(password, check_user.password)) {
      if (check_user.roleID == 1) {
        let table = await model.TableEntity.findOne({
          where: { userID: check_user.userID },
        });
        let token = {
          userID: check_user.userID,
          tableID: table.tableID,
          roleID: check_user.roleID,
        };
        return { data: token, status: 200 };
      } else {
        let token = { userID: check_user.userID, roleID: check_user.roleID };
        return { data: token, status: 200 };
      }
    } else {
      return { error: "Incorrect email or password", status: 400 };
    }
  } catch (error) {
    console.error(error);
    return { error: "Error logging in", status: 500 };
  }
};
