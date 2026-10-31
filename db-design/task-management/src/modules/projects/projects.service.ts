import { CreateProjectDTO, UpdateProjectDTO } from "./projects.schema";
import { Project, ProjectStats, UpdateProject } from "./projects.types";
import { _ProjectRepo } from "./projects.repo";
import { apiError } from "../../utils/apiErrors";
import { isForeignKeyViolation } from "../../utils/postgresError";
import { _UserRepo } from "../users/users.repo";
import { getLogger } from "../../observability/logger";

export class _ProjectService {
  constructor(
    private readonly repo: _ProjectRepo,
    private readonly userRepo: _UserRepo,
  ) {}

  async getAllProjects(): Promise<Project[]> {
    const logger = getLogger();
    const projects = await this.repo.getAllProjects();

    logger.info(
      { layer: "service", operation: "project.getAllProjects" },
      "All projects fetched",
    );
    return projects;
  }

  async createProjectWithOwner(data: CreateProjectDTO): Promise<Project> {
    const logger = getLogger();
    const project = {
      name: data.name,
      status: data.status,
      description: data.description,
      owner_id: data.ownerId,
    };

    let projectWithOwner;
    try {
      projectWithOwner = await this.repo.createProjectWithOwner(project);
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw apiError.badRequest("Owner with this id doesn't exists");
      }
      throw err;
    }

    if (!projectWithOwner) {
      logger.error(
        {
          layer: "service",
          operation: "project.createProjectWithOwner",
          err: new Error("Something went wrong while creating project"),
        },
        "Unexpected Error while creating project",
      );
      throw apiError.internal("Something went wrong while creating project");
    }

    logger.info(
      { layer: "service", operation: "project.createProjectWithOwner" },
      "project created with owner",
    );

    return projectWithOwner;
  }

  async getProjectById(projectId: string): Promise<Project> {
    const logger = getLogger();
    let project = await this.repo.getProjectById(projectId);

    logger.info(
      { layer: "service", operation: "project.getProjectById" },
      "project fetched with id",
    );

    return project;
  }

  async updateProjectById(projectId: string, data: UpdateProjectDTO) {
    const logger = getLogger();
    const project = {
      name: data.name,
      status: data.status,
      description: data.description,
    } as UpdateProject;

    const updateProject = await this.repo.updateProjectById(projectId, project);
    if (!updateProject) {
      throw apiError.notfound("Project with this id");
    }

    logger.info(
      { layer: "service", operation: "project.updateProjectById" },
      "project updated by id",
    );
    return updateProject;
  }

  async deleteProjectById(projectId: string) {
    const logger = getLogger();
    const deletedRow = await this.repo.deleteProjectById(projectId);

    if (deletedRow === 0) {
      throw apiError.notfound("Project with this id");
    }
    logger.info(
      { layer: "service", operation: "project.deleteProjectById" },
      "project deleted by id",
    );
  }

  async getUsersProjectsByUserId(userId: string): Promise<Project[]> {
    const logger = getLogger();
    const projects: Project[] =
      await this.repo.getUsersProjectsByUserId(userId);

    if (
      projects.length === 0 &&
      !(await this.userRepo.userExistsById(userId))
    ) {
      throw apiError.notfound("User with this id");
    }

    logger.info(
      { layer: "service", operation: "project.getUsersProjectsByUserId" },
      "user's project fetched",
    );

    return projects;
  }

  async getProjectStatsById(projectId: string): Promise<ProjectStats> {
    const logger = getLogger();
    const stats = await this.repo.getProjectStatsById(projectId);

    if (!stats) {
      throw apiError.notfound("Project with this id");
    }

    logger.info(
      { layer: "service", operation: "project.getProjectStatsById" },
      "project stats fetched",
    );

    return stats;
  }
}
