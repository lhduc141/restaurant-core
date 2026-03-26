import cors from "cors";
import express from "express";
import sequelize from "./config/database.js";
import router from "./routes/rootRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Use the routes defined in the routes folder
app.use("/", router);

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected success");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
