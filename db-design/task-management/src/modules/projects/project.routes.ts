import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProjectSchema,
  projectParamSchema,
  updateProjectShema,
} from "./project.schema";
import {
  createProjectWithOwner,
  getProjectsById,
  getAllProjects,
  updateProjectById,
  deleteProjectById,
} from "./project.controller";

const projectRouter = Router();

projectRouter.get("/", getAllProjects);
projectRouter.get(
  "/:projectId",
  validate(projectParamSchema, "params"),
  getProjectsById,
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

export { projectRouter };
