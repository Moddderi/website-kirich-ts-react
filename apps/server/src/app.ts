import "./loadEnv.js";
import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import cabinetRoutes from "./routes/cabinetRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import tailoringRoutes from "./routes/tailoringRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import { startScheduler } from "./jobs/scheduler.js";
import { ensureCatalogLeadDaysSynced } from "./utils/catalogLeadDaysStore.js";

const app = express();

const jsonDefault = express.json({ limit: "256kb" });
/** Photo reference uploads send base64 in JSON (~4/3 of file size). */
const jsonReferenceImage = express.json({ limit: "8mb" });

app.use(cors());
app.use((req, res, next) => {
  const isReferenceUpload =
    req.method === "POST" && req.path === "/api/orders/reference-image";
  if (isReferenceUpload) return jsonReferenceImage(req, res, next);
  return jsonDefault(req, res, next);
});

// Підключаємо роути
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/my-order", cabinetRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/tailoring", tailoringRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/config", configRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  startScheduler();
  void ensureCatalogLeadDaysSynced().catch((error) => {
    console.error("⚠️ Catalog lead days initial sync:", error);
  });
});
