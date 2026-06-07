import type { Request, Response } from "express";
import { param, query, validationResult } from "express-validator";
import { LeaderboardService } from "./leaderboard.service";

const service = new LeaderboardService();

export const leaderboardValidators = {
  getThemeLeaderboard: [
    param("themeId").isInt(),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("escaped_only").optional().isBoolean(),
  ],
  getAllLeaderboards: [
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  getRecordRank: [
    param("recordId").isInt(),
  ],
  getPlayerRank: [
    query("phone").isString().isLength({ min: 1 }),
    query("theme_id").optional().isInt(),
  ],
};

export async function getThemeLeaderboard(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { themeId } = request.params;
  const { limit, escaped_only } = request.query;

  const result = await service.getThemeLeaderboard(
    Number(themeId),
    limit ? Number(limit) : 10,
    escaped_only !== undefined ? escaped_only === "true" : true
  );

  if (!result) {
    return response.status(404).json({ error: "主题不存在" });
  }
  response.json(result);
}

export async function getAllThemesLeaderboards(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { limit } = request.query;
  const result = await service.getAllThemesLeaderboards(
    limit ? Number(limit) : 10
  );
  response.json(result);
}

export async function getRecordRank(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { recordId } = request.params;
  const result = await service.getRecordRank(Number(recordId));
  if (!result) {
    return response.status(404).json({ error: "战绩不存在" });
  }
  response.json(result);
}

export async function getPlayerRecordWithRank(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { phone, theme_id } = request.query;
  const result = await service.getPlayerRecordWithRank(
    phone as string,
    theme_id ? Number(theme_id) : undefined
  );
  response.json(result);
}
