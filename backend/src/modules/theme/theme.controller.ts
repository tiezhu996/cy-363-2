import type { Request, Response } from "express";
import { body, validationResult, param, query } from "express-validator";
import { ThemeService } from "./theme.service";

const service = new ThemeService();

export const themeValidators = {
  create: [
    body("name").isString().isLength({ min: 1, max: 100 }),
    body("type").isString().isLength({ min: 1, max: 50 }),
    body("difficulty").isInt({ min: 1, max: 5 }),
    body("suggested_players").isInt({ min: 1 }),
    body("duration_minutes").isInt({ min: 1 }),
    body("description").optional().isString(),
    body("poster_url").optional().isString(),
  ],
  update: [
    param("id").isInt(),
    body("name").optional().isString().isLength({ min: 1, max: 100 }),
    body("type").optional().isString().isLength({ min: 1, max: 50 }),
    body("difficulty").optional().isInt({ min: 1, max: 5 }),
    body("suggested_players").optional().isInt({ min: 1 }),
    body("duration_minutes").optional().isInt({ min: 1 }),
    body("description").optional().isString(),
    body("poster_url").optional().isString(),
    body("is_active").optional().isBoolean(),
  ],
  list: [
    query("type").optional().isString(),
    query("is_active").optional().isBoolean(),
  ],
  get: [param("id").isInt()],
  delete: [param("id").isInt()],
};

export async function getThemes(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { type, is_active } = request.query;
  const themes = await service.getThemes({
    type: type as string,
    is_active: is_active === "true",
  });
  response.json(themes);
}

export async function getTheme(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { id } = request.params;
  const theme = await service.getThemeById(Number(id));
  if (!theme) {
    return response.status(404).json({ error: "主题不存在" });
  }
  response.json(theme);
}

export async function createTheme(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const theme = await service.createTheme(request.body);
  response.status(201).json(theme);
}

export async function updateTheme(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { id } = request.params;
  const theme = await service.updateTheme(Number(id), request.body);
  if (!theme) {
    return response.status(404).json({ error: "主题不存在" });
  }
  response.json(theme);
}

export async function deleteTheme(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { id } = request.params;
  const result = await service.deleteTheme(Number(id));
  if (!result) {
    return response.status(404).json({ error: "主题不存在" });
  }
  response.json({ message: "删除成功" });
}
