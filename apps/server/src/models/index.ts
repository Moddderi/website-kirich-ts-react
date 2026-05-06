import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize, DataTypes, Model, ModelStatic } from "sequelize";
import process from "process";

// Подгружаем конфиг с новым синтаксисом атрибутов импорта
import configData from "../config/config.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const env = (process.env.NODE_ENV || "development") as keyof typeof configData;
const config = (configData as any)[env];

// Определяем интерфейс для нашего объекта базы данных
interface DbInterface {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  [key: string]: any;
}

const db: DbInterface = {} as DbInterface;

let sequelize: Sequelize;
if (config.use_env_variable) {
  const envVar = process.env[config.use_env_variable];
  if (!envVar)
    throw new Error(
      `Environment variable ${config.use_env_variable} not found`,
    );
  sequelize = new Sequelize(envVar, config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

// Читаем файлы моделей (.js для скомпилированного кода и .ts для разработки)
const files = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    (file.slice(-3) === ".js" || file.slice(-3) === ".ts") &&
    file.indexOf(".test.js") === -1 &&
    file.indexOf(".d.ts") === -1
  );
});

// Используем top-level await для динамических импортов
for (const file of files) {
  const modelModule = await import(path.join(__dirname, file));

  // Большинство моделей экспортируются как default функция: export default (sequelize) => ...
  const modelFactory = modelModule.default;

  if (typeof modelFactory === "function") {
    const model = modelFactory(sequelize, DataTypes);
    db[model.name] = model;
  }
}

// Настраиваем связи (associations)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
