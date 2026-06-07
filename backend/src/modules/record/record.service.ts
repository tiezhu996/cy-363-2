import { Op } from "sequelize";
import { GameRecord, TeamMember, Theme } from "../../models";

interface TeamMemberInput {
  player_name: string;
  player_phone?: string;
}

interface CreateRecordInput {
  theme_id: number;
  team_name: string;
  player_count: number;
  completion_time_seconds: number;
  hint_count: number;
  escaped: boolean;
  record_date: string;
  notes?: string;
  team_members?: TeamMemberInput[];
}

export class RecordService {
  async getRecords(params?: {
    theme_id?: number;
    start_date?: string;
    end_date?: string;
    escaped?: boolean;
    page?: number;
    page_size?: number;
  }) {
    const where: any = {};
    if (params?.theme_id) {
      where.theme_id = params.theme_id;
    }
    if (params?.start_date) {
      where.record_date = { [Op.gte]: params.start_date };
    }
    if (params?.end_date) {
      where.record_date = {
        ...where.record_date,
        [Op.lte]: params.end_date,
      };
    }
    if (params?.escaped !== undefined) {
      where.escaped = params.escaped;
    }

    const page = params?.page || 1;
    const page_size = params?.page_size || 20;
    const offset = (page - 1) * page_size;

    const { count, rows } = await GameRecord.findAndCountAll({
      where,
      include: [
        {
          model: Theme,
          as: "theme",
          attributes: ["id", "name", "type", "difficulty"],
        },
        {
          model: TeamMember,
          as: "teamMembers",
          attributes: ["id", "player_name", "player_phone"],
        },
      ],
      order: [["record_date", "DESC"], ["created_at", "DESC"]],
      limit: page_size,
      offset,
    });

    return {
      total: count,
      page,
      page_size,
      records: rows,
    };
  }

  async getRecordById(id: number) {
    return GameRecord.findByPk(id, {
      include: [
        {
          model: Theme,
          as: "theme",
          attributes: ["id", "name", "type", "difficulty"],
        },
        {
          model: TeamMember,
          as: "teamMembers",
          attributes: ["id", "player_name", "player_phone"],
        },
      ],
    });
  }

  async createRecord(data: CreateRecordInput) {
    const { team_members, ...recordData } = data;

    const record = await GameRecord.create(recordData);

    if (team_members && team_members.length > 0) {
      const members = team_members.map((m) => ({
        ...m,
        record_id: record.id,
      }));
      await TeamMember.bulkCreate(members);
    }

    return this.getRecordById(record.id);
  }

  async updateRecord(
    id: number,
    data: {
      theme_id?: number;
      team_name?: string;
      player_count?: number;
      completion_time_seconds?: number;
      hint_count?: number;
      escaped?: boolean;
      record_date?: string;
      notes?: string;
      team_members?: TeamMemberInput[];
    }
  ) {
    const record = await GameRecord.findByPk(id);
    if (!record) {
      return null;
    }

    const { team_members, ...updateData } = data;
    await record.update(updateData);

    if (team_members) {
      await TeamMember.destroy({ where: { record_id: id } });
      if (team_members.length > 0) {
        const members = team_members.map((m) => ({
          ...m,
          record_id: id,
        }));
        await TeamMember.bulkCreate(members);
      }
    }

    return this.getRecordById(id);
  }

  async deleteRecord(id: number) {
    const record = await GameRecord.findByPk(id);
    if (!record) {
      return null;
    }
    return record.destroy();
  }

  async getRecordsByPhone(phone: string) {
    const members = await TeamMember.findAll({
      where: { player_phone: phone },
      include: [
        {
          model: GameRecord,
          as: "gameRecord",
          include: [
            {
              model: Theme,
              as: "theme",
              attributes: ["id", "name", "type", "difficulty"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return members.map((m) => m.gameRecord).filter(Boolean);
  }
}
