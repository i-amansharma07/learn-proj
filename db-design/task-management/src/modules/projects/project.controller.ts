import { ApiResponse } from "../../utils/ApiResponse";
import { RequestHandler, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CreateProjectDTO, UpdateProjectDTO } from "./project.schema";
import { ProjectService } from "../../container";

const getAllProjects: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const projects = await ProjectService.getAllProjects();

    return res
      .status(200)
      .json(new ApiResponse(projects, "All Projects Fetched"));
  },
);

const getProjectById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { projectId } = res.locals.validated["params"];
    const project = await ProjectService.getProjectById(projectId);

    return res.status(200).json(new ApiResponse(project, "Project Fetched"));
  },
);

const createProjectWithOwner: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = res.locals.validated["body"] as CreateProjectDTO;

    const project = await ProjectService.createProjectWithOwner(data);

    return res
      .status(201)
      .json(new ApiResponse(project, "Project Created Successfully"));
  },
);

const updateProjectById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { projectId } = res.locals.validated["params"];
    const projectData = res.locals.validated["body"] as UpdateProjectDTO;

    if (Object.keys(projectData).length === 0) {
      return res
        .status(200)
        .json(new ApiResponse({}, "No fields provided for update"));
    }
    const project = await ProjectService.updateProjectById(
      projectId,
      projectData,
    );

    return res.status(200).json(new ApiResponse(project, "Project Updated"));
  },
);

const deleteProjectById: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { projectId } = await res.locals.validated["params"];

    await ProjectService.deleteProjectById(projectId);

    return res.status(204).send();
  },
);

const getUsersProjectsByUserId: RequestHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const { userId } = await res.locals.validated["params"];

    const projects = await ProjectService.getUsersProjectsByUserId(userId);

    return res
      .status(200)
      .json(new ApiResponse(projects, "User's projects fetched"));
  },
);

export {
  createProjectWithOwner,
  getProjectById,
  getAllProjects,
  updateProjectById,
  deleteProjectById,
  getUsersProjectsByUserId,
};
