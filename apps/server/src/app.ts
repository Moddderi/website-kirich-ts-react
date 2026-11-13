import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import cabinetRoutes from "./routes/cabinetRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import { startScheduler } from "./jobs/scheduler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Підключаємо роути
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/my-order", cabinetRoutes);
app.use("/api/jobs", jobRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  startScheduler();
});
