import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
  CreateTaskSchema,
  TaskParamSchema,
  UpdateTaskSchema,
} from "./tasks.schema";
import {
  createTask,
  updateTaskById,
  deleteTaskById,
  getTaskById,
  getAllOverdueTasks,
} from "./tasks.controller";

export const tasksRouter = Router();

//creating a new Task
tasksRouter.post("/", validate(CreateTaskSchema, "body"), createTask);

//get All overdue tasks
tasksRouter.get("/overdue", getAllOverdueTasks);

//get task by Id
tasksRouter.get("/:taskId", validate(TaskParamSchema, "params"), getTaskById);

//update task by Id
tasksRouter.patch(
  "/:taskId",
  validate(TaskParamSchema, "params"),
  validate(UpdateTaskSchema, "body"),
  updateTaskById,
);
//delete task by Id
tasksRouter.delete(
  "/:taskId",
  validate(TaskParamSchema, "params"),
  deleteTaskById,
);
