import { Op } from "sequelize";
import { Theme } from "../../models";

export class ThemeService {
  async getThemes(params?: { type?: string; is_active?: boolean }) {
    const where: any = {};
    if (params?.type) {
      where.type = params.type;
    }
    if (params?.is_active !== undefined) {
      where.is_active = params.is_active;
    }
    return Theme.findAll({
      where,
      order: [["created_at", "DESC"]],
    });
  }

  async getThemeById(id: number) {
    return Theme.findByPk(id);
  }

  async createTheme(data: {
    name: string;
    type: string;
    difficulty: number;
    suggested_players: number;
    duration_minutes: number;
    description?: string;
    poster_url?: string;
  }) {
    return Theme.create(data);
  }

  async updateTheme(
    id: number,
    data: {
      name?: string;
      type?: string;
      difficulty?: number;
      suggested_players?: number;
      duration_minutes?: number;
      description?: string;
      poster_url?: string;
      is_active?: boolean;
    }
  ) {
    const theme = await Theme.findByPk(id);
    if (!theme) {
      return null;
    }
    return theme.update(data);
  }

  async deleteTheme(id: number) {
    const theme = await Theme.findByPk(id);
    if (!theme) {
      return null;
    }
    return theme.destroy();
  }
}
