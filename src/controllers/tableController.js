import { responseData } from "../config/response.js";
import * as service from "../services/tableServices.js";

export default class TableController {
  static async getCurrentTable(req, res) {
    const { error, data, status } = await service.getCurrentTableService(req.user);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }

  static async showMenuItems(req, res) {
    const { error, data, status } = await service.showMenuItemsService();

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }

  static async registerCustomer(req, res) {
    const { tableID } = req.params;
    const { customerName, phone, guestCount } = req.body;

    const { error, data, status } = await service.registerCustomerService(
      customerName,
      phone,
      guestCount,
      Number(tableID),
      req.user
    );

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }

  static async getChosenItems(req, res) {
    const { sessionID } = req.params;
    const { error, data, status } = await service.getChosenItemsService(Number(sessionID));

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }

  static async chooseMenuItems(req, res) {
    const { sessionID } = req.params;
    const { items } = req.body;
    const { error, data, status } = await service.chooseMenuItemsService(Number(sessionID), items);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }

  static async editChosenItems(req, res) {
    const { sessionID } = req.params;
    const { items } = req.body;
    const { error, data, status } = await service.editChosenItemsService(Number(sessionID), items);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }

  static async submitOrder(req, res) {
    const { sessionID } = req.params;
    const { error, data, status } = await service.submitOrderService(Number(sessionID));

    if (error) {
      return responseData(res, error, null, status);
    }

    return responseData(res, "successful", data, status);
  }

  static async getBill(req, res) {
    const { sessionID } = req.params;
    const { error, data, status } = await service.getBillService(Number(sessionID));

    if (error) {
      return responseData(res, error, null, status);
    }

    return responseData(res, "successful", data, status);
  }

  static async checkoutBill(req, res) {
    const { sessionID } = req.params;
    const { payment_method, feedback } = req.body;

    const { error, data, status } = await service.checkoutBillService(
      Number(sessionID),
      payment_method,
      feedback
    );

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "successful", data, status);
  }
}
