import { responseData } from "../config/response.js";
import * as service from "../services/authServices.js";

export default class AuthController {
  static async signup(req, res) {
    const { role_id, email, password, name, quantity } = req.body;
    const { error, data, status } = await service.signupService(
      role_id,
      email,
      password,
      name,
      quantity
    );

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "creating the account successfully", data, status);
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const { error, data, status } = await service.loginService(email, password);

    if (error) {
      return responseData(res, error, null, status);
    }
    return responseData(res, "Login successfully", data, status);
  }
}
