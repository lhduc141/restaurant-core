// src/middlewares/requestId.js
import crypto from "crypto";

export default function requestId(req, res, next) {
  const incomingRequestId = req.headers["x-request-id"];
  const id =
    typeof incomingRequestId === "string" && incomingRequestId.trim()
      ? incomingRequestId.trim()
      : crypto.randomUUID();

  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}