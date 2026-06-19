import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
  declare id: CreationOptional<string>;
  declare firstName: string;
  declare lastName: string;
  declare phone: string;
  declare email: string;
  declare deliveryMethod: string;
  declare city: string | null;
  declare warehouse: string | null;
  declare paymentMethod: string;
  declare totalAmount: number;
  declare status: CreationOptional<string>;

  declare communicationMethod: string | null; // "telegram" | "instagram" | "phone"
  declare socialUsername: string | null; // "@username"

  declare orderType: "ready-made" | "custom";

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static associate(models: Record<string, any>) {
    // Один заказ может содержать много товаров (связь "один ко многим")
    Order.hasMany(models.OrderItem, { as: "items", foreignKey: "orderId" });
  }
}

export default (sequelize: Sequelize) => {
  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deliveryMethod: {
        type: DataTypes.STRING,
        allowNull: false, // "nova_poshta" | "pickup"
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true, // true, так как для самовывоза город может отсутствовать в форме
      },
      warehouse: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false, // "online" | "cod"
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending", // "pending" | "paid" | "shipped" | "cancelled"
      },
      communicationMethod: {
        type: DataTypes.STRING,
        allowNull: true, // true, потому что клиент может захотеть обычный звонок по телефону
      },
      socialUsername: {
        type: DataTypes.STRING,
        allowNull: true, // true, если выбран телефон, никнейм не нужен
      },
      orderType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ready-made", // По умолчанию обычные товары
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
    },
  );

  return Order;
};
