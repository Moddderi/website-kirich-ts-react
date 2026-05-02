import { Sequelize } from "sequelize";
// Імпортуємо твій JSON (додай .json в кінці)
import configData from "./config.json" with { type: "json" };

const env = process.env.NODE_ENV || "development";
// @ts-ignore
const config = configData[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false, // щоб не засмічувати консоль логами SQL
  },
);

export default sequelize;
