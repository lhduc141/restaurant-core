import cors from "cors";
import express from "express";
import sequelize from "./config/database.js";
import initModels from "./models/init-models.js";
import { ROLE } from "./constant/enum.js";
import router from "./routes/rootRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Use the routes defined in the routes folder
app.use("/", router);

const bootstrapDatabase = async () => {
  await sequelize.authenticate();
  console.log("Database connected success");

  const syncMode = (process.env.DB_SYNC_MODE || "alter").trim().toLowerCase();

  if (syncMode === "force") {
    throw new Error(
      "DB_SYNC_MODE=force is disabled to protect data. Use DB_SYNC_MODE=alter for non-destructive schema sync."
    );
  }

  if (syncMode === "alter") {
    await sequelize.sync({ alter: true });
    console.log("Database schema synced with mode: alter");
  }

  if (syncMode !== "alter" && syncMode !== "none") {
    console.log(`Unknown DB_SYNC_MODE='${syncMode}', fallback to 'none'.`);
  }

  const model = initModels(sequelize);
  await model.Role.upsert({ roleID: ROLE.STAFF, roleName: "Staff" });
  await model.Role.upsert({ roleID: ROLE.ADMIN, roleName: "Admin" });
};

const startServer = async () => {
  try {
    await bootstrapDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start application:", err);
    process.exit(1);
  }
};

startServer();
