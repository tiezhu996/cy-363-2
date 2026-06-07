import { Router } from "express";
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordsByPhone,
  recordValidators,
} from "./record.controller";

export const recordRouter = Router();

recordRouter.get("/records", recordValidators.list, getRecords);
recordRouter.get("/records/player", recordValidators.queryByPhone, getRecordsByPhone);
recordRouter.get("/records/:id", recordValidators.get, getRecord);
recordRouter.post("/records", recordValidators.create, createRecord);
recordRouter.put("/records/:id", recordValidators.update, updateRecord);
recordRouter.delete("/records/:id", recordValidators.delete, deleteRecord);
