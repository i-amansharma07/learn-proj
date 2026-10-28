import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProjectSchema,
  projectParamSchema,
  updateProjectShema,
} from "./projects.schema";
import {
  createProjectWithOwner,
  getProjectById,
  getAllProjects,
  updateProjectById,
  deleteProjectById,
  getProjectStatsById,
} from "./projects.controller";
import { getProjectWithIdTasks } from "../tasks/tasks.controller";

const projectRouter = Router();

projectRouter.get("/", getAllProjects);
projectRouter.get(
  "/:projectId",
  validate(projectParamSchema, "params"),
  getProjectById,
);
projectRouter.post(
  "/",
  validate(createProjectSchema, "body"),
  createProjectWithOwner,
);
projectRouter.patch(
  "/:projectId",
  validate(projectParamSchema, "params"),
  validate(updateProjectShema, "body"),
  updateProjectById,
);
projectRouter.delete(
  "/:projectId",
  validate(projectParamSchema, "params"),
  deleteProjectById,
);

projectRouter.get(
  "/:projectId/stats",
  validate(projectParamSchema, "params"),
  getProjectStatsById,
);

//get project's tasks
projectRouter.get(
  "/:projectId/tasks",
  validate(projectParamSchema, "params"),
  getProjectWithIdTasks,
);

export { projectRouter };
