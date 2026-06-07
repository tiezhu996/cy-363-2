import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { Theme } from "./Theme";

export class GameRecord extends Model {
  public id!: number;
  public theme_id!: number;
  public team_name!: string;
  public player_count!: number;
  public completion_time_seconds!: number;
  public hint_count!: number;
  public escaped!: boolean;
  public record_date!: Date;
  public notes!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly theme?: Theme;
}

GameRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    theme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Theme,
        key: "id",
      },
    },
    team_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    player_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completion_time_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hint_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    escaped: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    record_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "game_records",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["theme_id"] },
      { fields: ["record_date"] },
      { fields: ["escaped"] },
      { fields: ["completion_time_seconds"] },
    ],
  }
);

GameRecord.belongsTo(Theme, {
  foreignKey: "theme_id",
  as: "theme",
});

Theme.hasMany(GameRecord, {
  foreignKey: "theme_id",
  as: "gameRecords",
});
