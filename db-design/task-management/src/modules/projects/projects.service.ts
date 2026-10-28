import { CreateProjectDTO, UpdateProjectDTO } from "./projects.schema";
import { Project, ProjectStats, UpdateProject } from "./projects.types";
import { _ProjectRepo } from "./projects.repo";
import { apiError } from "../../utils/apiErrors";
import { isForeignKeyViolation } from "../../utils/postgresError";
import { _UserRepo } from "../users/users.repo";

export class _ProjectService {
  constructor(
    private readonly repo: _ProjectRepo,
    private readonly userRepo: _UserRepo,
  ) {}

  async getAllProjects(): Promise<Project[]> {
    const projects = await this.repo.getAllProjects();

    return projects;
  }

  async createProjectWithOwner(data: CreateProjectDTO): Promise<Project> {
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
      throw apiError.internal("Something went wrong while creating project");
    }

    return projectWithOwner;
  }

  async getProjectById(projectId: string): Promise<Project> {
    let project = await this.repo.getProjectById(projectId);

    return project;
  }

  async updateProjectById(projectId: string, data: UpdateProjectDTO) {
    const project = {
      name: data.name,
      status: data.status,
      description: data.description,
    } as UpdateProject;

    const updateProject = await this.repo.updateProjectById(projectId, project);
    if (!updateProject) {
      throw apiError.notfound("Project with this id");
    }

    return updateProject;
  }

  async deleteProjectById(projectId: string) {
    const deletedRow = await this.repo.deleteProjectById(projectId);

    if (deletedRow === 0) {
      throw apiError.notfound("Project with this id");
    }
  }

  async getUsersProjectsByUserId(userId: string): Promise<Project[]> {
    const projects: Project[] =
      await this.repo.getUsersProjectsByUserId(userId);

    if (
      projects.length === 0 &&
      !(await this.userRepo.userExistsById(userId))
    ) {
      throw apiError.notfound("User with this id");
    }

    return projects;
  }

  async getProjectStatsById(projectId: string): Promise<ProjectStats> {
    const stats = await this.repo.getProjectStatsById(projectId);

    if (!stats) {
      throw apiError.notfound("Project with this id");
    }
    return stats;
  }
}
