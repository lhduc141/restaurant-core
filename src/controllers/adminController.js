import { responseData } from "../config/response.js";
import * as service from "../services/adminServices.js";

export default class AdminController {
  static async editStatusOfMenuItems(req, res) {
    const { adminID } = req.params;
    const { items } = req.body;
    const { error, data, status } = await service.editStatusOfMenuItemsService(adminID, items);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "success", data, status);
  }

  static async updateTableStatus(req, res) {
    const { adminID, tableID } = req.params;
    const { status: nextStatus } = req.body;
    const { error, data, status } = await service.updateTableStatusService(
      adminID,
      Number(tableID),
      nextStatus
    );

    if (error) {
      return responseData(res, error, null, status);
    }

    return responseData(res, "success", data, status);
  }

  static async editMenu(req, res) {
    const { itemID, itemName, type_of_food, price, descriptions, preparation_time } = req.body;
    const { error, data, status } = await service.editMenuService(
      itemID,
      itemName,
      type_of_food,
      price,
      descriptions,
      preparation_time
    );

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "success", data, status);
  }

  static async addNewFood(req, res) {
    const { itemName, type_of_food, price, descriptions, preparation_time, image } = req.body;
    const { error, data, status } = await service.addNewFoodService(
      itemName,
      type_of_food,
      price,
      descriptions,
      preparation_time,
      image
    );

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "success", data, status);
  }

  static async getItemsOfTables(req, res) {
    const quantity = req.query.quantity ? Number(req.query.quantity) : undefined;
    const { error, data, status } = await service.getItemsOfTablesService(quantity);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "success", data, status);
  }

  static async getTableDetail(req, res) {
    const { tableID } = req.params;
    const { error, data, status } = await service.getTableDetailService(Number(tableID));

    if (error) {
      return responseData(res, error, null, status);
    }

    return responseData(res, "success", data, status);
  }

  static async viewDetailTransaction(req, res) {
    const transactionID = Number(req.query.transactionID);
    const { error, data, status } = await service.viewDetailTransactionService(transactionID);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "success", data, status);
  }

  static async confirmPayment(req, res) {
    const { adminID, transactionID } = req.params;
    const { error, data, status } = await service.confirmPaymentService(
      Number(adminID),
      Number(transactionID)
    );

    if (error) {
      return responseData(res, error, null, status);
    }

    return responseData(res, "success", data, status);
  }

  static async getDailyRevenue(req, res) {
    const { date } = req.query;
    const { error, data, status } = await service.getDailyRevenueService(date);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }

  static async listTables(req, res) {
    const quantity = req.query.quantity ? Number(req.query.quantity) : undefined;
    const { error, data, status } = await service.listTablesService(quantity);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }
}
