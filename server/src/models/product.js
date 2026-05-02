import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class Product extends Model {
  static associate(models) {
    // Зв'язки, якщо будуть потрібні
  }
}

Product.init(
  {
    name: DataTypes.STRING,
    product_code: {
      type: DataTypes.STRING,
      allowNull: false, // Якщо цей код обов'язковий
      unique: true, // Якщо код товару має бути унікальним
    },
    price: DataTypes.DECIMAL(10, 2),
    category: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    imageUrl: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "Products", // Sequelize зазвичай додає "s", краще вказати явно
  },
);

export { Product };
