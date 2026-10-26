import { CreateProjectDTO, UpdateProjectDTO } from "./project.schema";
import { Project, UpdateProject } from "./project.types";
import { _ProjectRepo } from "./project.repo";
import { apiError } from "../../utils/apiErrors";
import { tr } from "zod/v4/locales";
import { isForeignKeyViolation } from "../../utils/postgresError";

export class _ProjectService {
  constructor(private readonly repo: _ProjectRepo) {}

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
    if (!project) {
      throw apiError.notfound("Project with this Id");
    }

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

    return projects;
  }
}
