import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

// 1. Описываем класс модели с использованием дженериков для полной типизации
class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  // CreationOptional говорит TS, что при создании записи эти поля можно не передавать (их заполнит БД)
  declare id: CreationOptional<number>;
  declare name: string;
  declare price: number;
  declare imageUrl: string;
  declare product_code: string;

  declare main_category: string;
  declare sub_type: string;
  declare stock: number;

  // Даты тоже обычно генерирует БД автоматически
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // 2. Фикс ошибки 7006: явно указываем тип для models
  // Мы используем Record<string, any>, чтобы не было конфликтов с другими моделями
  static associate(models: Record<string, any>) {
    // Здесь будут твои связи, например:
    // Product.belongsTo(models.Category);
  }
}

// 3. Экспортируем функцию инициализации (как того требует твой index.ts)
export default (sequelize: Sequelize) => {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      imageUrl: {
        // <--- 2. И ОБЯЗАТЕЛЬНО СЮДА
        type: DataTypes.STRING,
        allowNull: true,
      },
      product_code: {
        type: DataTypes.STRING,
        allowNull: false, // или true, если не у всех товаров есть код
        unique: true, // обычно коды товаров уникальны
      },
      main_category: {
        type: DataTypes.STRING,
        allowNull: false, // Обязательно для фильтрации
      },
      sub_type: {
        type: DataTypes.STRING,
        allowNull: false, // Обязательно для фильтрации
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
    },
  );

  return Product;
};
