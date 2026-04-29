import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = 5005;

app.use(cors());

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({
    status: "success",
    message: "Бэкенд на связи! Сервер работает корректно.",
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`
  🚀 ==========================================
  ✅ Сервер запущен!
  🔗 Адрес: http://localhost:${PORT}
  📡 Проверка API: http://localhost:${PORT}/api/test
  ==============================================
  `);
});
