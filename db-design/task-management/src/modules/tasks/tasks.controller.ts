import type { RequestHandler, Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { CreateTaskDTO, UpdateTaskDTO } from "./tasks.schema";
import { asyncHandler } from "../../utils/asyncHandler";
import { TaskService } from "../../container";

const createTask: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = res.locals.validated["body"] as CreateTaskDTO;
    const req = await TaskService.createTask(data);
    return res.status(201).json(new ApiResponse(req, "Task Created"));
  },
);

const getTaskById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { taskId } = res.locals.validated["params"];

    const task = await TaskService.getTaskById(taskId);

    return res.status(200).json(new ApiResponse(task, "Task fetched"));
  },
);

const updateTaskById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { taskId } = res.locals.validated["params"];
    const data = res.locals.validated["body"] as UpdateTaskDTO;

    if (Object.keys(data).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse({}, "No fields provided for updation"));
    }

    const updateTask = await TaskService.updateTaskById(taskId, data);

    return res.status(200).json(new ApiResponse(updateTask, "Task updated"));
  },
);

const deleteTaskById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { taskId } = res.locals.validated["params"];

    await TaskService.deleteTaskById(taskId);

    return res.status(204).send();
  },
);

const getAllOverdueTasks: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const overDueTasks = await TaskService.getAllOverdueTasks();

    return res
      .status(200)
      .json(new ApiResponse(overDueTasks, "Overdue tasks fetched"));
  },
);

const getUserWithIdTasks: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { userId } = res.locals.validated["params"];
    const tasks = await TaskService.getUserWithIdTasks(userId);

    return res.status(200).json(new ApiResponse(tasks, "User's tasks fetched"));
  },
);

const getProjectWithIdTasks: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { projectId } = res.locals.validated["params"];
    const tasks = await TaskService.getProjectWithIdTasks(projectId);

    return res
      .status(200)
      .json(new ApiResponse(tasks, "Project's tasks fetched"));
  },
);

export {
  createTask,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  getAllOverdueTasks,
  getUserWithIdTasks,
  getProjectWithIdTasks
};
