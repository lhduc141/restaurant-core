import cors from "cors";
import express from "express";
import http from "http";
import sequelize from "./config/database.js";
import initModels from "./models/init-models.js";
import { ROLE } from "./constant/enum.js";
import router from "./routes/rootRoutes.js";
import requestId from "./middlewares/requestId.js";
import { initSocket } from "./realtime/socket.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(requestId);
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: process.env.PORTAL_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

const bootstrapDatabase = async () => {
  await sequelize.authenticate();
  console.log("Database connected success");

  const syncMode = (process.env.DB_SYNC_MODE || "none").trim().toLowerCase();
  if (syncMode === "alter" || syncMode === "force") {
    throw new Error(
      "Runtime schema sync is disabled. Remove DB_SYNC_MODE=alter/force and apply migrations before startup."
    );
  }

  if (syncMode !== "none") {
    console.log(`Unknown DB_SYNC_MODE='${syncMode}', fallback to 'none'.`);
  }

  console.log("Runtime schema sync is disabled (migration path only).");

  const model = initModels(sequelize);
  await model.Role.upsert({ roleID: ROLE.STAFF, roleName: "Table" });
  await model.Role.upsert({ roleID: ROLE.ADMIN, roleName: "Admin" });
};

const startServer = async () => {
  try {
    await bootstrapDatabase();
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start application:", err);
    process.exit(1);
  }
};

startServer();