import { checkToken } from "../config/jwt.js";
import { responseData } from "../config/response.js";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.headers.token;

  if (!token) {
    return responseData(res, "Unauthorized", null, 401);
  }

  const payload = checkToken(token);
  if (!payload) {
    return responseData(res, "Invalid or expired token", null, 401);
  }

  req.user = payload;
  return next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleID)) {
      return responseData(res, "Forbidden", null, 403);
    }
    return next();
  };
};
