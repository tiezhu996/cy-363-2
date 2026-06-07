import cors from "cors";
import express from "express";
import helmet from "helmet";
import { overviewRouter } from "./modules/overview/overview.routes";
import { themeRouter } from "./modules/theme/theme.routes";
import { recordRouter } from "./modules/record/record.routes";
import { leaderboardRouter } from "./modules/leaderboard/leaderboard.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.use("/", overviewRouter);
app.use("/api", overviewRouter);
app.use("/api", themeRouter);
app.use("/api", recordRouter);
app.use("/api", leaderboardRouter);
