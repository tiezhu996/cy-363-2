import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { GameRecord } from "./GameRecord";

export class TeamMember extends Model {
  public id!: number;
  public record_id!: number;
  public player_name!: string;
  public player_phone!: string;
  public readonly created_at!: Date;
  public readonly gameRecord?: GameRecord;
}

TeamMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GameRecord,
        key: "id",
      },
    },
    player_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    player_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "team_members",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      { fields: ["record_id"] },
      { fields: ["player_phone"] },
    ],
  }
);

TeamMember.belongsTo(GameRecord, {
  foreignKey: "record_id",
  as: "gameRecord",
});

GameRecord.hasMany(TeamMember, {
  foreignKey: "record_id",
  as: "teamMembers",
});
