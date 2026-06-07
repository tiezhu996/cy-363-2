import { Router } from "express";
import {
  getThemes,
  getTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  themeValidators,
} from "./theme.controller";

export const themeRouter = Router();

themeRouter.get("/themes", themeValidators.list, getThemes);
themeRouter.get("/themes/:id", themeValidators.get, getTheme);
themeRouter.post("/themes", themeValidators.create, createTheme);
themeRouter.put("/themes/:id", themeValidators.update, updateTheme);
themeRouter.delete("/themes/:id", themeValidators.delete, deleteTheme);
