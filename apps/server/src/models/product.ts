import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

// 1. Описываем класс модели
class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare search_name: string;
  declare price: number;

  // ИЗМЕНЕНО: Тема с массивом строк для типизации TypeScript
  declare imageUrl: string[];

  declare product_code: string;
  declare main_category: string;
  declare sub_type: string;
  declare stock: number;
  declare dance_program: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: Record<string, any>) {
    // Здесь будут твои связи
  }
}

// 2. Экспортируем функцию инициализации
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
      search_name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      // ИЗМЕНЕНО: Поле images вместо imageUrl
      imageUrl: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
        get() {
          // Явно указываем as any, чтобы избежать Property does not exist on type 'never'
          const rawValue = this.getDataValue("imageUrl") as any;

          // Если драйвер вернул массив в виде строки '{url1,url2}'
          if (typeof rawValue === "string" && rawValue.startsWith("{")) {
            const cleaned = rawValue.replace(/^\{/, "").replace(/\}$/, "");
            return cleaned ? cleaned.split(",") : [];
          }

          // Если это уже массив строк — возвращаем как есть
          if (Array.isArray(rawValue)) {
            return rawValue;
          }

          return [];
        },
      },

      product_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      dance_program: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      main_category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sub_type: {
        type: DataTypes.STRING,
        allowNull: false,
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
      indexes: [
        {
          name: "products_main_category_idx",
          fields: ["main_category"],
        },
        {
          name: "products_dance_program_idx",
          fields: ["dance_program"],
        },
        {
          name: "products_sub_type_idx",
          fields: ["sub_type"],
        },
        {
          name: "products_filters_composite_idx",
          fields: ["main_category", "dance_program", "sub_type"],
        },
      ],
    },
  );

  return Product;
};
