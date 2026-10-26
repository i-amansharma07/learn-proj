import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
  createProjectSchema,
  projectParamSchema,
  updateProjectShema,
} from "./project.schema";
import {
  createProjectWithOwner,
  getProjectById,
  getAllProjects,
  updateProjectById,
  deleteProjectById,
  getUsersProjectsByUserId,
} from "./project.controller";
import { userParamSchema } from "../users/user.schema";

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
  "/user/:userId",
  validate(userParamSchema, "params"),
  getUsersProjectsByUserId,
);

export { projectRouter };
