import { responseData } from "../config/response.js";
import * as service from "../services/adminServices.js";


export default class AdminController {

  static async editStatusOfMenuItems(req, res) {
    const {adminID} = req.params;
    const { items } = req.body;
    const { error, data, status } = await service.editStatusOfMenuItemsService(adminID, items);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "success", data, status);
  }
  static async editMenu(req, res) {
    const { itemID, itemName, type_of_food, price, descriptions, preparation_time } = req.body;
    const { error, data, status } = await service.editMenuService(itemID, itemName, type_of_food, price, descriptions, preparation_time);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "success", data, status);
  }
  static async addNewFood(req, res) {
    const { itemName, type_of_food, price, descriptions, preparation_time, image} = req.body;
    const { error, data, status } = await service.addNewFoodService(itemName, type_of_food, price, descriptions, preparation_time, image);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "success", data, status);
  }
  
  
  static async getItemsOfTables(req, res) {
    const { error, data, status } = await service.getItemsOfTablesService();

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "success", data, status);
  }


  
  static async viewDetailTransaction(req, res) {
    const { transactionID } = req.body;
    const { error, data, status } = await service.viewDetailTransactionService(transactionID);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "", data, status);
  }
  
  
  static async getDailyRevenue(req, res) {
    const { date } = req.body;
    const { error, data, status } = await service.getDailyRevenueService(date);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "successful", data, status);
  }
  static async listTables(req, res) {
    const { quantity  } = req.body;
    const { error, data, status } = await service.listTablesService(quantity);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "successful", data, status);
  }
  
}
