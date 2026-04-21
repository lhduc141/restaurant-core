import express from "express";
import authRoutes from "./authRoutes.js";
import tableRoutes from "./tableRoutes.js";
import adminRoutes from "./adminRoutes.js";
import agentRouter from "../agent/agent.router.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/table", tableRoutes);
router.use("/admin", adminRoutes);
router.use("/agent", agentRouter);

export default router;