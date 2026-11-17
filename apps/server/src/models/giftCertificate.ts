import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

class GiftCertificate extends Model<
  InferAttributes<GiftCertificate>,
  InferCreationAttributes<GiftCertificate>
> {
  declare id: CreationOptional<string>;
  declare number: number;
  declare electronicCode: CreationOptional<string | null>;
  declare amountUah: number;
  declare buyerLabel: string;
  declare purchaserFirstName: string;
  declare purchaserLastName: string;
  declare purchaserPhone: string;
  declare purchaserEmail: string;
  declare purchasedAt: string;
  declare validUntil: string;
  declare status: CreationOptional<
    "inactive" | "active" | "used" | "expired"
  >;
  declare notionPageId: CreationOptional<string | null>;
  declare usedAt: CreationOptional<string | null>;
  declare usedOrderId: CreationOptional<string | null>;
  declare communicationMethod: CreationOptional<string | null>;
  declare socialUsername: CreationOptional<string | null>;
  declare comment: CreationOptional<string | null>;
  declare requestPhysicalDelivery: CreationOptional<boolean>;
  declare deliveryMethod: CreationOptional<string | null>;
  declare deliveryCity: CreationOptional<string | null>;
  declare deliveryWarehouse: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export default (sequelize: Sequelize) => {
  GiftCertificate.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      number: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      electronicCode: { type: DataTypes.STRING, allowNull: true, unique: true },
      amountUah: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      buyerLabel: { type: DataTypes.STRING, allowNull: false },
      purchaserFirstName: { type: DataTypes.STRING, allowNull: false },
      purchaserLastName: { type: DataTypes.STRING, allowNull: false },
      purchaserPhone: { type: DataTypes.STRING, allowNull: false },
      purchaserEmail: { type: DataTypes.STRING, allowNull: false },
      purchasedAt: { type: DataTypes.DATEONLY, allowNull: false },
      validUntil: { type: DataTypes.DATEONLY, allowNull: false },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "inactive",
      },
      notionPageId: { type: DataTypes.STRING, allowNull: true },
      usedAt: { type: DataTypes.DATEONLY, allowNull: true },
      usedOrderId: { type: DataTypes.UUID, allowNull: true },
      communicationMethod: { type: DataTypes.STRING, allowNull: true },
      socialUsername: { type: DataTypes.STRING, allowNull: true },
      comment: { type: DataTypes.TEXT, allowNull: true },
      requestPhysicalDelivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deliveryMethod: { type: DataTypes.STRING, allowNull: true },
      deliveryCity: { type: DataTypes.STRING, allowNull: true },
      deliveryWarehouse: { type: DataTypes.STRING, allowNull: true },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "GiftCertificate",
      tableName: "GiftCertificates",
    },
  );

  return GiftCertificate;
};