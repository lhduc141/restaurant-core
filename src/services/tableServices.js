import Joi from "joi";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {
  FOOD_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ROLE,
  SESSION_STATUS,
  TABLE_STATUS,
} from "../constant/enum.js";

const model = initModels(sequelize);

const startSessionSchema = Joi.object({
  customerName: Joi.string().min(1).required(),
  phone: Joi.string().allow("", null).optional(),
  guestCount: Joi.number().integer().min(1).required(),
  tableID: Joi.number().integer().required(),
});

const orderItemsSchema = Joi.array()
  .items(
    Joi.object({
      itemID: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
      note: Joi.string().allow("", null).optional(),
    })
  )
  .min(1)
  .required();

const checkoutSchema = Joi.object({
  payment_method: Joi.string()
    .valid(PAYMENT_METHOD.CASH, PAYMENT_METHOD.CARD, PAYMENT_METHOD.TRANSFER, PAYMENT_METHOD.OTHER)
    .required(),
  feedback: Joi.string().allow("", null).optional(),
});

const mapSessionResponse = (session) => ({
  customerID: session.sessionID,
  sessionID: session.sessionID,
  tableID: session.tableID,
  customerName: session.customerName,
  phone: session.phone,
  guestCount: session.guestCount,
  checkInTime: session.checkInTime,
  status: session.status,
});

const getSessionByID = async (sessionID) => {
  const session = await model.ServiceSession.findByPk(sessionID);
  if (!session) {
    return { error: "Session not found", status: 404 };
  }
  return { session };
};

const getDraftOrder = async (sessionID) => {
  return model.Order.findOne({
    where: {
      sessionID,
      status: ORDER_STATUS.NEW,
    },
    order: [["orderID", "DESC"]],
  });
};

const getNextOrderNumber = async (sessionID) => {
  const latest = await model.Order.findOne({
    where: { sessionID },
    order: [["orderNumber", "DESC"]],
  });
  return latest ? latest.orderNumber + 1 : 1;
};

const summarizeSubmittedItems = async (sessionID) => {
  const orders = await model.Order.findAll({
    where: {
      sessionID,
      status: [ORDER_STATUS.SENT_TO_KITCHEN, ORDER_STATUS.COMPLETED],
    },
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
            attributes: ["itemID", "itemName", "typeOfFood", "preparationTime"],
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

export const getCurrentTableService = async (authUser) => {
  try {
    if (!authUser || authUser.roleID !== ROLE.STAFF) {
      return { error: "Only staff can access current table detail", status: 403 };
    }

    const table = authUser.tableID
      ? await model.TableEntity.findByPk(authUser.tableID)
      : await model.TableEntity.findOne({ where: { tabletAccountID: authUser.accountID } });

    if (!table) {
      return { error: "Assigned table not found", status: 404 };
    }

    if (table.tabletAccountID !== authUser.accountID) {
      return { error: "Staff can only view assigned table", status: 403 };
    }

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
      ? await summarizeSubmittedItems(activeSession.sessionID)
      : { totalDishCount: 0, totalBill: 0, orderedItems: [] };

    return {
      data: {
        tableID: table.tableID,
        tableName: table.tableName,
        capacity: table.capacity,
        status: table.status,
        activeSession: activeSession ? mapSessionResponse(activeSession) : null,
        transactionID,
        totalDishCount: summary.totalDishCount,
        totalBill: summary.totalBill,
        orderedItems: summary.orderedItems,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error fetching current table detail", status: 500 };
  }
};

export const showMenuItemsService = async () => {
  try {
    const types = await model.MenuItem.findAll({
      attributes: ["typeOfFood"],
      where: { status: true },
      group: ["typeOfFood"],
      order: [["typeOfFood", "ASC"]],
    });

    const groupedMenuItems = [];

    for (const typeRow of types) {
      const type = typeRow.typeOfFood;
      const items = await model.MenuItem.findAll({
        where: { typeOfFood: type, status: true },
        attributes: [
          "itemID",
          "itemName",
          "price",
          "descriptions",
          "preparationTime",
          "image",
        ],
        order: [["itemName", "ASC"]],
      });

      groupedMenuItems.push({
        type_of_food: type,
        items,
      });
    }

    return { data: groupedMenuItems, status: 200 };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error fetching menu items", status: 500 };
  }
};

export const registerCustomerService = async (
  customerName,
  phone,
  guestCount,
  tableID,
  authUser
) => {
  const { error } = startSessionSchema.validate({
    customerName,
    phone,
    guestCount,
    tableID,
  });

  if (error) {
    return { error: error.details[0].message, status: 400 };
  }

  try {
    if (!authUser || authUser.roleID !== ROLE.STAFF) {
      return { error: "Only staff can start a dining session", status: 403 };
    }

    const table = await model.TableEntity.findByPk(tableID);
    if (!table) {
      return { error: "Table not found", status: 404 };
    }

    if (table.tabletAccountID !== authUser.accountID) {
      return { error: "Staff can only operate on assigned table", status: 403 };
    }

    if (table.status !== TABLE_STATUS.VACANT) {
      return { error: "Table is occupied", status: 400 };
    }

    const activeSession = await model.ServiceSession.findOne({
      where: {
        tableID,
        status: [SESSION_STATUS.OPEN, SESSION_STATUS.PAID],
      },
    });

    if (activeSession) {
      return { error: "This table already has an active session", status: 400 };
    }

    const session = await model.ServiceSession.create({
      tableID,
      customerName,
      phone: phone || null,
      guestCount,
      status: SESSION_STATUS.OPEN,
      checkInTime: new Date(),
    });

    table.status = TABLE_STATUS.OCCUPIED;
    await table.save();

    return {
      data: {
        ...mapSessionResponse(session),
        tableStatus: table.status,
      },
      status: 201,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error starting dining session", status: 500 };
  }
};

export const chooseMenuItemsService = async (sessionID, items) => {
  const { error } = orderItemsSchema.validate(items);
  if (error) {
    return { error: error.details[0].message, status: 400 };
  }

  try {
    const { session, error: sessionError, status } = await getSessionByID(sessionID);
    if (sessionError) {
      return { error: sessionError, status };
    }

    if (session.status !== SESSION_STATUS.OPEN) {
      return { error: "Cannot add draft items to closed session", status: 400 };
    }

    let draftOrder = await getDraftOrder(sessionID);
    if (!draftOrder) {
      const nextOrderNumber = await getNextOrderNumber(sessionID);
      draftOrder = await model.Order.create({
        sessionID,
        orderNumber: nextOrderNumber,
        status: ORDER_STATUS.NEW,
      });
    }

    const createdItems = [];

    for (const item of items) {
      const menuItem = await model.MenuItem.findOne({
        where: { itemID: item.itemID, status: true },
      });

      if (!menuItem) {
        return { error: `Menu item ${item.itemID} not found or unavailable`, status: 404 };
      }

      const unitPrice = Number(menuItem.price || 0);
      const lineTotal = unitPrice * item.quantity;

      const orderItem = await model.OrderItem.create({
        orderID: draftOrder.orderID,
        itemID: item.itemID,
        note: item.note || null,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
        status: FOOD_STATUS.ORDERED,
        isCancelled: false,
      });

      createdItems.push(orderItem);
    }

    return { data: createdItems, status: 201 };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error adding draft order items", status: 500 };
  }
};

export const editChosenItemsService = async (sessionID, items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "items must be a non-empty array", status: 400 };
  }

  try {
    const { session, error: sessionError, status } = await getSessionByID(sessionID);
    if (sessionError) {
      return { error: sessionError, status };
    }

    if (session.status !== SESSION_STATUS.OPEN) {
      return { error: "Cannot edit draft items of closed session", status: 400 };
    }

    const draftOrder = await getDraftOrder(sessionID);
    if (!draftOrder) {
      // If there is no draft order but item exists in submitted/completed orders,
      // return business-rule error instead of a generic not-found.
      const submittedOrders = await model.Order.findAll({
        where: {
          sessionID,
          status: [ORDER_STATUS.SENT_TO_KITCHEN, ORDER_STATUS.COMPLETED],
        },
        attributes: ["orderID"],
      });

      const submittedOrderIDs = submittedOrders.map((entry) => entry.orderID);
      if (submittedOrderIDs.length > 0) {
        for (const item of items) {
          if (!item.itemID) {
            continue;
          }

          const submittedItem = await model.OrderItem.findOne({
            where: {
              orderID: submittedOrderIDs,
              itemID: item.itemID,
              isCancelled: false,
            },
            order: [["orderItemID", "DESC"]],
          });

          if (submittedItem && submittedItem.status !== FOOD_STATUS.ORDERED) {
            return {
              error: `Item ${item.itemID} cannot be edited/deleted in status ${submittedItem.status}`,
              status: 400,
            };
          }
        }
      }

      return { error: "No draft order to edit", status: 404 };
    }

    const updatedItems = [];

    for (const item of items) {
      if (!item.itemID) {
        return { error: "itemID is required", status: 400 };
      }

      const orderItem = await model.OrderItem.findOne({
        where: {
          orderID: draftOrder.orderID,
          itemID: item.itemID,
          isCancelled: false,
        },
      });

      if (!orderItem) {
        return { error: `Draft item ${item.itemID} not found`, status: 404 };
      }

      if (orderItem.status !== FOOD_STATUS.ORDERED) {
        return { error: `Item ${item.itemID} cannot be edited in status ${orderItem.status}`, status: 400 };
      }

      if (item.deleted === true) {
        orderItem.isCancelled = true;
        orderItem.status = FOOD_STATUS.CANCELLED;
        await orderItem.save();
        updatedItems.push(orderItem);
        continue;
      }

      const newQuantity = item.quantity ?? orderItem.quantity;
      if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
        return { error: `Invalid quantity for item ${item.itemID}`, status: 400 };
      }

      const menuItem = await model.MenuItem.findByPk(item.itemID);
      if (!menuItem) {
        return { error: `Menu item ${item.itemID} not found`, status: 404 };
      }

      orderItem.quantity = newQuantity;
      orderItem.note = item.note ?? orderItem.note;
      orderItem.unitPrice = Number(menuItem.price || 0);
      orderItem.lineTotal = orderItem.unitPrice * newQuantity;
      await orderItem.save();

      updatedItems.push(orderItem);
    }

    return { data: updatedItems, status: 200 };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error editing draft order items", status: 500 };
  }
};

export const submitOrderService = async (sessionID) => {
  try {
    const { session, error: sessionError, status } = await getSessionByID(sessionID);
    if (sessionError) {
      return { error: sessionError, status };
    }

    if (session.status !== SESSION_STATUS.OPEN) {
      return { error: "Cannot submit order for closed session", status: 400 };
    }

    const draftOrder = await getDraftOrder(sessionID);
    if (!draftOrder) {
      return { error: "No draft order found", status: 404 };
    }

    const draftItems = await model.OrderItem.findAll({
      where: {
        orderID: draftOrder.orderID,
        isCancelled: false,
        status: FOOD_STATUS.ORDERED,
      },
    });

    if (!draftItems.length) {
      return { error: "No draft items to submit", status: 400 };
    }

    for (const item of draftItems) {
      item.status = FOOD_STATUS.PREPARING;
      await item.save();
    }

    draftOrder.status = ORDER_STATUS.SENT_TO_KITCHEN;
    await draftOrder.save();

    const summary = await summarizeSubmittedItems(sessionID);

    return {
      data: {
        customerID: sessionID,
        sessionID,
        submittedItems: draftItems.length,
        totalDishCount: summary.totalDishCount,
        totalBill: summary.totalBill,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error submitting order", status: 500 };
  }
};

export const getChosenItemsService = async (sessionID) => {
  try {
    const { session, error: sessionError, status } = await getSessionByID(sessionID);
    if (sessionError) {
      return { error: sessionError, status };
    }

    const summary = await summarizeSubmittedItems(sessionID);

    return {
      data: {
        ...mapSessionResponse(session),
        totalDishCount: summary.totalDishCount,
        totalBill: summary.totalBill,
        orderedItems: summary.orderedItems,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error fetching ordered items", status: 500 };
  }
};

export const getBillService = async (sessionID) => {
  try {
    const { session, error: sessionError, status } = await getSessionByID(sessionID);
    if (sessionError) {
      return { error: sessionError, status };
    }

    const summary = await summarizeSubmittedItems(sessionID);

    return {
      data: {
        customerID: sessionID,
        sessionID,
        tableID: session.tableID,
        totalDishCount: summary.totalDishCount,
        totalBill: summary.totalBill,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error fetching bill", status: 500 };
  }
};

export const checkoutBillService = async (sessionID, payment_method, feedback) => {
  const { error } = checkoutSchema.validate({ payment_method, feedback });
  if (error) {
    return { error: error.details[0].message, status: 400 };
  }

  try {
    const { session, error: sessionError, status } = await getSessionByID(sessionID);
    if (sessionError) {
      return { error: sessionError, status };
    }

    if (session.status !== SESSION_STATUS.OPEN) {
      return { error: "Session is not open for payment request", status: 400 };
    }

    const summary = await summarizeSubmittedItems(sessionID);
    if (!summary.orderedItems.length) {
      return { error: "No submitted items found for checkout", status: 400 };
    }

    const existingPending = await model.Transaction.findOne({
      where: {
        sessionID,
        paymentStatus: PAYMENT_STATUS.PENDING,
      },
      order: [["transactionID", "DESC"]],
    });

    if (existingPending) {
      return {
        data: existingPending,
        status: 200,
      };
    }

    const transaction = await model.Transaction.create({
      sessionID,
      paymentMethod: payment_method,
      paymentStatus: PAYMENT_STATUS.PENDING,
      totalPrice: summary.totalBill,
      feedback: feedback || null,
    });

    return {
      data: {
        transactionID: transaction.transactionID,
        sessionID,
        paymentStatus: transaction.paymentStatus,
        totalPrice: transaction.totalPrice,
      },
      status: 200,
    };
  } catch (serviceError) {
    console.error(serviceError);
    return { error: "Error requesting payment", status: 500 };
  }
};
