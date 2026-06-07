import type { Request, Response } from "express";
import { body, validationResult, param, query } from "express-validator";
import { RecordService } from "./record.service";

const service = new RecordService();

export const recordValidators = {
  create: [
    body("theme_id").isInt(),
    body("team_name").isString().isLength({ min: 1, max: 100 }),
    body("player_count").isInt({ min: 1 }),
    body("completion_time_seconds").isInt({ min: 0 }),
    body("hint_count").isInt({ min: 0 }),
    body("escaped").isBoolean(),
    body("record_date").isISO8601(),
    body("notes").optional().isString(),
    body("team_members").optional().isArray(),
    body("team_members.*.player_name").optional().isString().isLength({ min: 1, max: 50 }),
    body("team_members.*.player_phone").optional().isString(),
  ],
  update: [
    param("id").isInt(),
    body("theme_id").optional().isInt(),
    body("team_name").optional().isString().isLength({ min: 1, max: 100 }),
    body("player_count").optional().isInt({ min: 1 }),
    body("completion_time_seconds").optional().isInt({ min: 0 }),
    body("hint_count").optional().isInt({ min: 0 }),
    body("escaped").optional().isBoolean(),
    body("record_date").optional().isISO8601(),
    body("notes").optional().isString(),
    body("team_members").optional().isArray(),
    body("team_members.*.player_name").optional().isString().isLength({ min: 1, max: 50 }),
    body("team_members.*.player_phone").optional().isString(),
  ],
  list: [
    query("theme_id").optional().isInt(),
    query("start_date").optional().isISO8601(),
    query("end_date").optional().isISO8601(),
    query("escaped").optional().isBoolean(),
    query("page").optional().isInt({ min: 1 }),
    query("page_size").optional().isInt({ min: 1, max: 100 }),
  ],
  get: [param("id").isInt()],
  delete: [param("id").isInt()],
  queryByPhone: [query("phone").isString().isLength({ min: 1 })],
};

export async function getRecords(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { theme_id, start_date, end_date, escaped, page, page_size } = request.query;
  const result = await service.getRecords({
    theme_id: theme_id ? Number(theme_id) : undefined,
    start_date: start_date as string,
    end_date: end_date as string,
    escaped: escaped !== undefined ? escaped === "true" : undefined,
    page: page ? Number(page) : undefined,
    page_size: page_size ? Number(page_size) : undefined,
  });
  response.json(result);
}

export async function getRecord(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { id } = request.params;
  const record = await service.getRecordById(Number(id));
  if (!record) {
    return response.status(404).json({ error: "战绩不存在" });
  }
  response.json(record);
}

export async function createRecord(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const record = await service.createRecord(request.body);
  response.status(201).json(record);
}

export async function updateRecord(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { id } = request.params;
  const record = await service.updateRecord(Number(id), request.body);
  if (!record) {
    return response.status(404).json({ error: "战绩不存在" });
  }
  response.json(record);
}

export async function deleteRecord(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { id } = request.params;
  const result = await service.deleteRecord(Number(id));
  if (!result) {
    return response.status(404).json({ error: "战绩不存在" });
  }
  response.json({ message: "删除成功" });
}

export async function getRecordsByPhone(request: Request, response: Response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }
  const { phone } = request.query;
  const records = await service.getRecordsByPhone(phone as string);
  response.json(records);
}
