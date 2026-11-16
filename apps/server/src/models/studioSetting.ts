import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

class StudioSetting extends Model<
  InferAttributes<StudioSetting>,
  InferCreationAttributes<StudioSetting>
> {
  declare key: string;
  declare value: Record<string, unknown>;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  StudioSetting.init(
    {
      key: { type: dataTypes.STRING(64), primaryKey: true },
      value: { type: dataTypes.JSONB, allowNull: false },
      createdAt: dataTypes.DATE,
      updatedAt: dataTypes.DATE,
    },
    {
      sequelize,
      modelName: "StudioSetting",
      tableName: "StudioSettings",
    },
  );
  return StudioSetting;
};