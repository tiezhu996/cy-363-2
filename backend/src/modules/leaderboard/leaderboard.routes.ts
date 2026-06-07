import { Router } from "express";
import {
  getThemeLeaderboard,
  getAllThemesLeaderboards,
  getRecordRank,
  getPlayerRecordWithRank,
  leaderboardValidators,
} from "./leaderboard.controller";

export const leaderboardRouter = Router();

leaderboardRouter.get(
  "/leaderboards",
  leaderboardValidators.getAllLeaderboards,
  getAllThemesLeaderboards
);
leaderboardRouter.get(
  "/leaderboards/theme/:themeId",
  leaderboardValidators.getThemeLeaderboard,
  getThemeLeaderboard
);
leaderboardRouter.get(
  "/leaderboards/record/:recordId",
  leaderboardValidators.getRecordRank,
  getRecordRank
);
leaderboardRouter.get(
  "/leaderboards/player",
  leaderboardValidators.getPlayerRank,
  getPlayerRecordWithRank
);
