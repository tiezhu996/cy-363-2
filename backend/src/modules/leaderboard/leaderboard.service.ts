import { Op, literal, col } from "sequelize";
import { GameRecord, Theme, TeamMember } from "../../models";

interface LeaderboardEntry {
  rank: number;
  team_name: string;
  player_count: number;
  completion_time_seconds: number;
  completion_time_display: string;
  hint_count: number;
  record_date: string;
  escaped: boolean;
}

interface ThemeLeaderboard {
  theme: {
    id: number;
    name: string;
    type: string;
    difficulty: number;
    duration_minutes: number;
  };
  leaderboard: LeaderboardEntry[];
  total_records: number;
  escape_rate: number;
  average_time: number;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}时${minutes}分${secs}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  }
  return `${secs}秒`;
};

export class LeaderboardService {
  async getThemeLeaderboard(
    themeId: number,
    limit: number = 10,
    escapedOnly: boolean = true
  ): Promise<ThemeLeaderboard | null> {
    const theme = await Theme.findByPk(themeId, {
      attributes: ["id", "name", "type", "difficulty", "duration_minutes"],
    });

    if (!theme) {
      return null;
    }

    const where: any = {
      theme_id: themeId,
    };
    if (escapedOnly) {
      where.escaped = true;
    }

    const records = await GameRecord.findAll({
      where,
      include: [
        {
          model: TeamMember,
          as: "teamMembers",
          attributes: ["player_name", "player_phone"],
        },
      ],
      order: [
        ["completion_time_seconds", "ASC"],
        ["hint_count", "ASC"],
        ["record_date", "ASC"],
      ],
      limit,
    });

    const leaderboard: LeaderboardEntry[] = records.map((record, index) => ({
      rank: index + 1,
      team_name: record.team_name,
      player_count: record.player_count,
      completion_time_seconds: record.completion_time_seconds,
      completion_time_display: formatTime(record.completion_time_seconds),
      hint_count: record.hint_count,
      record_date: record.record_date.toString(),
      escaped: record.escaped,
    }));

    const stats = await GameRecord.findAll({
      where: { theme_id: themeId },
      attributes: [
        [literal("COUNT(*)"), "total"],
        [literal("SUM(CASE WHEN escaped = 1 THEN 1 ELSE 0 END)"), "escaped_count"],
        [literal("AVG(CASE WHEN escaped = 1 THEN completion_time_seconds ELSE NULL END)"), "avg_time"],
      ],
      raw: true,
    }) as unknown as Array<{ total: number; escaped_count: number; avg_time: number }>;

    const totalRecords = Number(stats[0]?.total || 0);
    const escapedCount = Number(stats[0]?.escaped_count || 0);
    const avgTime = Number(stats[0]?.avg_time || 0);

    return {
      theme: theme.toJSON(),
      leaderboard,
      total_records: totalRecords,
      escape_rate: totalRecords > 0 ? Math.round((escapedCount / totalRecords) * 100) : 0,
      average_time: Math.round(avgTime),
    };
  }

  async getAllThemesLeaderboards(limit: number = 10): Promise<ThemeLeaderboard[]> {
    const themes = await Theme.findAll({
      where: { is_active: true },
      attributes: ["id", "name", "type", "difficulty", "duration_minutes"],
      order: [["created_at", "DESC"]],
    });

    const leaderboards: ThemeLeaderboard[] = [];

    for (const theme of themes) {
      const lb = await this.getThemeLeaderboard(theme.id, limit);
      if (lb) {
        leaderboards.push(lb);
      }
    }

    return leaderboards;
  }

  async getRecordRank(
    recordId: number
  ): Promise<{ global_rank: number; theme_rank: number; total_in_theme: number } | null> {
    const record = await GameRecord.findByPk(recordId);
    if (!record) {
      return null;
    }

    const themeRankResult = await GameRecord.findAll({
      where: {
        theme_id: record.theme_id,
        escaped: true,
        completion_time_seconds: { [Op.lte]: record.completion_time_seconds },
      },
      attributes: [[literal("COUNT(DISTINCT completion_time_seconds)"), "rank"]],
      raw: true,
    }) as unknown as Array<{ rank: number }>;

    const globalRankResult = await GameRecord.findAll({
      where: {
        escaped: true,
        completion_time_seconds: { [Op.lte]: record.completion_time_seconds },
      },
      attributes: [[literal("COUNT(DISTINCT completion_time_seconds)"), "rank"]],
      raw: true,
    }) as unknown as Array<{ rank: number }>;

    const totalInThemeResult = await GameRecord.findAll({
      where: {
        theme_id: record.theme_id,
        escaped: true,
      },
      attributes: [[literal("COUNT(*)"), "total"]],
      raw: true,
    }) as unknown as Array<{ total: number }>;

    return {
      theme_rank: Number(themeRankResult[0]?.rank || 0),
      global_rank: Number(globalRankResult[0]?.rank || 0),
      total_in_theme: Number(totalInThemeResult[0]?.total || 0),
    };
  }

  async getPlayerRecordWithRank(
    phone: string,
    themeId?: number
  ): Promise<Array<{ record: any; rank: number; total_in_theme: number }>> {
    const where: any = { player_phone: phone };

    const members = await TeamMember.findAll({
      where,
      include: [
        {
          model: GameRecord,
          as: "gameRecord",
          where: themeId ? { theme_id: themeId } : undefined,
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

    const results = [];

    for (const member of members) {
      const record = member.gameRecord;
      if (!record || !record.escaped) continue;

      const rankInfo = await this.getRecordRank(record.id);
      if (rankInfo) {
        results.push({
          record: record.toJSON(),
          rank: rankInfo.theme_rank,
          total_in_theme: rankInfo.total_in_theme,
        });
      }
    }

    return results;
  }
}
