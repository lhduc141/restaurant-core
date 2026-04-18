import Joi from "joi";
import { Op } from "sequelize";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {
  FOOD_STATUS,
  FOOD_STATUS_FLOW,
  ORDER_STATUS,
  PAYMENT_STATUS,
  SESSION_STATUS,
  TABLE_STATUS,
} from "../constant/enum.js";

const model = initModels(sequelize);

const statusUpdateSchema = Joi.object({
  chooseID: Joi.number().integer().required(),
  status: Joi.string()
    .valid(FOOD_STATUS.PREPARING, FOOD_STATUS.IN_PROGRESS, FOOD_STATUS.SERVED)
    .required(),
});

const editMenuSchema = Joi.object({
  itemID: Joi.number().integer().required(),
  itemName: Joi.string().optional(),
  type_of_food: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  descriptions: Joi.string().allow(null, "").optional(),
  preparation_time: Joi.number().integer().min(0).optional(),
});

const addMenuSchema = Joi.object({
  itemName: Joi.string().required(),
  type_of_food: Joi.string().required(),
  price: Joi.number().min(0).required(),
  descriptions: Joi.string().allow(null, "").optional(),
  preparation_time: Joi.number().integer().min(0).required(),
  image: Joi.string().allow(null, "").optional(),
});

const getAdminByAccountID = async (accountID) => {
  const admin = await model.Admin.findOne({ where: { accountID } });
  if (!admin) {
    return { error: "Admin not found", status: 404 };
  }
  return { admin };
};

const summarizeSession = async (sessionID) => {
  const orders = await model.Order.findAll({
    where: { sessionID },
    include: [
      {
        model: model.OrderItem,
        as: "OrderItems",
        where: { isCancelled: false },
        required: false,
        include: [
          {
            model: model.MenuItem,
            as: "item",
            attributes: ["itemName", "typeOfFood", "preparationTime"],
          },
        ],
      },
    ],
    order: [["orderID", "ASC"]],
  });

  const orderedItems = [];
  let totalDishCount = 0;
  let totalBill = 0;

  for (const order of orders) {
    for (const item of order.OrderItems || []) {
      const quantity = Number(item.quantity || 0);
      const lineTotal = Number(item.lineTotal || 0);

      totalDishCount += quantity;
      totalBill += lineTotal;

      orderedItems.push({
        chooseID: item.orderItemID,
        orderItemID: item.orderItemID,
        orderID: order.orderID,
        itemID: item.itemID,
        itemName: item.item?.itemName || null,
        type_of_food: item.item?.typeOfFood || null,
        quantity,
        note: item.note,
        status: item.status,
        lineTotal,
        preparation_time: item.item?.preparationTime ?? null,
      });
    }
  }

  return {
    totalDishCount,
    totalBill,
    orderedItems,
  };
};

const getLatestTransactionIDBySession = async (sessionID) => {
  const latestTransaction = await model.Transaction.findOne({
    where: { sessionID },
    order: [["transactionID", "DESC"]],
    attributes: ["transactionID"],
  });

  return latestTransaction?.transactionID || null;
};

export const editStatusOfMenuItemsService = async (authUser, items) => {
  try {
    if (!authUser?.accountID) {
      return { error: "Unauthorized", status: 401 };
    }

    const { error: adminError, status } = await getAdminByAccountID(authUser.accountID);
    if (adminError) {
      return { error: adminError, status };
    }

    if (!Array.isArray(items) || items.length === 0) {
      return { error: "items must be a non-empty array", status: 400 };
    }

    const updated = [];

    for (const item of items) {
      const { error } = statusUpdateSchema.validate(item);
      if (error) {
        return { error: error.details[0].message, status: 400 };
      }

      const orderItem = await model.OrderItem.findByPk(item.chooseID);
      if (!orderItem) {
        return { error: `Order item ${item.chooseID} not found`, status: 404 };
      }

      if (orderItem.isCancelled) {
        return { error: `Order item ${item.chooseID} is cancelled`, status: 400 };
      }

      const expectedNextStatus = FOOD_STATUS_FLOW[orderItem.status];
      if (expectedNextStatus !== item.status) {
        return {
          error: `Invalid transition for item ${item.chooseID}. Allowed: ${orderItem.status} -> ${expectedNextStatus || "N/A"}`,
          status: 400,
        };
      }

      orderItem.status = item.status;
      await orderItem.save();

      // Mark order as completed when all non-cancelled items are served.
      const siblingItems = await model.OrderItem.findAll({
        where: { orderID: orderItem.orderID, isCancelled: false },
      });
      if (siblingItems.length > 0 && siblingItems.every((entry) => entry.status === FOOD_STATUS.SERVED)) {
        const order = await model.Order.findByPk(orderItem.orderID);
        if (order) {
          order.status = ORDER_STATUS.COMPLETED;
          await order.save();
        }
      }

      updated.push({
        chooseID: orderItem.orderItemID,
        status: orderItem.status,
      });
    }

    return { data: updated, status: 200 };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error updating food status", status: 500 };
  }
};

export const getItemsOfTablesService = async (quantity) => {
  try {
    const where = quantity ? { capacity: quantity } : {};
    const tables = await model.TableEntity.findAll({
      where,
      order: [["tableID", "ASC"]],
    });

    const result = [];

    for (const table of tables) {
      const activeSession = await model.ServiceSession.findOne({
        where: {
          tableID: table.tableID,
          status: [SESSION_STATUS.OPEN, SESSION_STATUS.PAID],
        },
        order: [["sessionID", "DESC"]],
      });

      const transactionID = activeSession
        ? await getLatestTransactionIDBySession(activeSession.sessionID)
        : null;

      const summary = activeSession
        ? await summarizeSession(activeSession.sessionID)
        : { totalDishCount: 0, totalBill: 0, orderedItems: [] };

      result.push({
        tableID: table.tableID,
        tableName: table.tableName,
        capacity: table.capacity,
        status: table.status,
        activeSession: activeSession
          ? {
              sessionID: activeSession.sessionID,
              customerID: activeSession.sessionID,
              customerName: activeSession.customerName,
              phone: activeSession.phone,
              guestCount: activeSession.guestCount,
              checkInTime: activeSession.checkInTime,
              status: activeSession.status,
            }
          : null,
        transactionID,
        totalDishCount: summary.totalDishCount,
        totalBill: summary.totalBill,
        orderedItems: summary.orderedItems,
      });
    }

    return { data: result, status: 200 };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error fetching table overview", status: 500 };
  }
};

export const getTableDetailService = async (tableID) => {
  try {
    const table = await model.TableEntity.findByPk(tableID);
    if (!table) {
      return { error: "Table not found", status: 404 };
    }

    const activeSession = await model.ServiceSession.findOne({
      where: {
        tableID,
        status: [SESSION_STATUS.OPEN, SESSION_STATUS.PAID],
      },
      order: [["sessionID", "DESC"]],
    });

    const transactionID = activeSession
      ? await getLatestTransactionIDBySession(activeSession.sessionID)
      : null;

    const summary = activeSession
      ? await summarizeSession(activeSession.sessionID)
      : { totalDishCount: 0, totalBill: 0, orderedItems: [] };

    return {
      data: {
        tableID: table.tableID,
        tableName: table.tableName,
        capacity: table.capacity,
        status: table.status,
        activeSession: activeSession
          ? {
              sessionID: activeSession.sessionID,
              customerID: activeSession.sessionID,
              customerName: activeSession.customerName,
              phone: activeSession.phone,
              guestCount: activeSession.guestCount,
              checkInTime: activeSession.checkInTime,
              status: activeSession.status,
            }
          : null,
        transactionID,
        totalDishCount: summary.totalDishCount,
        totalBill: summary.totalBill,
        orderedItems: summary.orderedItems,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error fetching table detail", status: 500 };
  }
};

export const updateTableStatusService = async (authUser, tableID, status) => {
  try {
    if (!authUser?.accountID) {
      return { error: "Unauthorized", status: 401 };
    }

    const { error: adminError, status: adminStatus } = await getAdminByAccountID(authUser.accountID);
    if (adminError) {
      return { error: adminError, status: adminStatus };
    }

    if (![TABLE_STATUS.VACANT, TABLE_STATUS.OCCUPIED].includes(status)) {
      return { error: "Invalid table status", status: 400 };
    }

    const table = await model.TableEntity.findByPk(tableID);
    if (!table) {
      return { error: "Table not found", status: 404 };
    }

    const activeSession = await model.ServiceSession.findOne({
      where: {
        tableID,
        status: [SESSION_STATUS.OPEN, SESSION_STATUS.PAID],
      },
    });

    if (status === TABLE_STATUS.VACANT && activeSession) {
      return {
        error: "Cannot set VACANT while session is active",
        status: 400,
      };
    }

    if (status === TABLE_STATUS.OCCUPIED && !activeSession) {
      return {
        error: "Cannot set OCCUPIED without active session",
        status: 400,
      };
    }

    table.status = status;
    await table.save();

    return {
      data: {
        tableID: table.tableID,
        status: table.status,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error updating table status", status: 500 };
  }
};

export const viewDetailTransactionService = async (transactionID) => {
  try {
    const transaction = await model.Transaction.findByPk(transactionID);
    if (!transaction) {
      return { error: "Transaction not found", status: 404 };
    }

    const session = await model.ServiceSession.findByPk(transaction.sessionID);
    const summary = await summarizeSession(transaction.sessionID);

    return {
      data: {
        transactionID: transaction.transactionID,
        customerID: transaction.sessionID,
        sessionID: transaction.sessionID,
        payment_method: transaction.paymentMethod,
        paymentStatus: transaction.paymentStatus,
        totalPrice: Number(transaction.totalPrice || 0),
        feedback: transaction.feedback,
        paidAt: transaction.paidAt,
        customerName: session?.customerName || null,
        tableID: session?.tableID || null,
        items: summary.orderedItems,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error fetching transaction detail", status: 500 };
  }
};

export const confirmPaymentService = async (authUser, transactionID) => {
  try {
    if (!authUser?.accountID) {
      return { error: "Unauthorized", status: 401 };
    }

    const { error: adminError, status: adminStatus } = await getAdminByAccountID(authUser.accountID);
    if (adminError) {
      return { error: adminError, status: adminStatus };
    }

    const transaction = await model.Transaction.findByPk(transactionID);
    if (!transaction) {
      return { error: "Transaction not found", status: 404 };
    }

    if (transaction.paymentStatus !== PAYMENT_STATUS.PENDING) {
      return { error: "Only pending transactions can be confirmed", status: 400 };
    }

    const session = await model.ServiceSession.findByPk(transaction.sessionID);
    if (!session) {
      return { error: "Session not found", status: 404 };
    }

    transaction.paymentStatus = PAYMENT_STATUS.PAID;
    transaction.paidAt = new Date();
    await transaction.save();

    session.status = SESSION_STATUS.CLOSED;
    session.checkOutTime = new Date();
    await session.save();

    const table = await model.TableEntity.findByPk(session.tableID);
    if (table) {
      table.status = TABLE_STATUS.VACANT;
      await table.save();
    }

    return {
      data: {
        transactionID: transaction.transactionID,
        paymentStatus: transaction.paymentStatus,
        paidAt: transaction.paidAt,
        sessionID: session.sessionID,
        sessionStatus: session.status,
        tableID: session.tableID,
        tableStatus: table ? table.status : null,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error confirming payment", status: 500 };
  }
};

export const getDailyRevenueService = async (date) => {
  try {
    const targetDate = date ? new Date(date) : new Date();
    if (Number.isNaN(targetDate.getTime())) {
      return { error: "Invalid date format", status: 400 };
    }

    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const totalRevenue = await model.Transaction.sum("totalPrice", {
      where: {
        paymentStatus: PAYMENT_STATUS.PAID,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    return {
      data: {
        date: startDate.toISOString().slice(0, 10),
        totalRevenue: Number(totalRevenue || 0),
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Failed to fetch daily revenue", status: 500 };
  }
};

export const listTablesService = async (quantity) => {
  try {
    const whereCondition = quantity ? { capacity: quantity } : {};

    const vacant = await model.TableEntity.findAll({
      where: { ...whereCondition, status: TABLE_STATUS.VACANT },
      order: [["tableID", "ASC"]],
      attributes: ["tableID", "tableName", "capacity"],
    });

    const ongoing = await model.TableEntity.findAll({
      where: { ...whereCondition, status: TABLE_STATUS.OCCUPIED },
      order: [["tableID", "ASC"]],
      attributes: ["tableID", "tableName", "capacity"],
    });

    return {
      data: {
        vacant,
        ongoing,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return {
      error: "Failed to fetch tables by status",
      status: 500,
    };
  }
};

export const editMenuService = async (
  itemID,
  itemName,
  type_of_food,
  price,
  descriptions,
  preparation_time
) => {
  const { error } = editMenuSchema.validate({
    itemID,
    itemName,
    type_of_food,
    price,
    descriptions,
    preparation_time,
  });

  if (error) {
    return { error: error.details[0].message, status: 400 };
  }

  try {
    const menuItem = await model.MenuItem.findByPk(itemID);
    if (!menuItem) {
      return { error: `Menu item with ID ${itemID} not found`, status: 404 };
    }

    await menuItem.update({
      itemName: itemName ?? menuItem.itemName,
      typeOfFood: type_of_food ?? menuItem.typeOfFood,
      price: price ?? menuItem.price,
      descriptions: descriptions ?? menuItem.descriptions,
      preparationTime: preparation_time ?? menuItem.preparationTime,
    });

    return { data: menuItem, status: 200 };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Internal server error", status: 500 };
  }
};

export const addNewFoodService = async (
  itemName,
  type_of_food,
  price,
  descriptions,
  preparation_time,
  image
) => {
  const { error } = addMenuSchema.validate({
    itemName,
    type_of_food,
    price,
    descriptions,
    preparation_time,
    image,
  });

  if (error) {
    return { error: error.details[0].message, status: 400 };
  }

  try {
    const newFoodItem = await model.MenuItem.create({
      itemName,
      typeOfFood: type_of_food,
      price,
      descriptions: descriptions || null,
      preparationTime: preparation_time,
      image: image || null,
      status: true,
    });

    return { data: newFoodItem, status: 201 };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Internal server error", status: 500 };
  }
};
