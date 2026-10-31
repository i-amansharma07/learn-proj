import { CreateTaskDTO, UpdateTaskDTO } from "./tasks.schema";
import { _TaskRepo } from "./tasks.repo";
import { CreateTask, UpdateTask } from "./tasks.types";
import { isForeignKeyViolation } from "../../utils/postgresError";
import { apiError } from "../../utils/apiErrors";
import { getLogger } from "../../observability/logger";
import { _UserRepo } from "../users/users.repo";
import { _ProjectRepo } from "../projects/projects.repo";

export class _TaskService {
  constructor(
    private readonly repo: _TaskRepo,
    private readonly userRepo: _UserRepo,
    private readonly projectRepo: _ProjectRepo,
  ) {}

  async createTask(data: CreateTaskDTO) {
    const logger = getLogger();
    const taskData: CreateTask = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo,
      projectId: data.projectId,
      dueDate: data.dueDate,
    };

    let task;

    try {
      task = await this.repo.createTask(taskData);
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw apiError.badRequest("User is not part of this project");
      }
    }

    logger.info(
      { layer: "service", operation: "task.createTask" },
      "Task created",
    );

    return task;
  }

  async getTaskById(taskId: string) {
    const logger = getLogger();
    const task = await this.repo.getTaskById(taskId);
    logger.info(
      { layer: "service", operation: "task.getTaskById" },
      "Task by Id fetched",
    );
    return task;
  }

  async updateTaskById(taskId: string, data: UpdateTaskDTO) {
    const logger = getLogger();
    const task: UpdateTask = {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
    };

    const updateTask = await this.repo.updateTaskById(taskId, task);

    if (!updateTask) {
      throw apiError.notfound("Task with id");
    }

    logger.info(
      { layer: "service", operation: "task.updateTaskById" },
      "Task with Id updated",
    );
    return updateTask;
  }

  async deleteTaskById(taskId: string) {
    const logger = getLogger();
    const rowCount = await this.repo.deleteTaskById(taskId);
    if (rowCount === 0) {
      throw apiError.notfound("Task with this id");
    }

    logger.info(
      { layer: "service", operation: "task.deleteTaskById" },
      "Task by Id deleted",
    );
  }

  //TODO: maybe add projectId here
  async getAllOverdueTasks() {
    const logger = getLogger();
    const overDueTasks = await this.repo.getAllOverdueTasks();
    logger.info(
      { layer: "service", operation: "task.getAllOverdueTasks" },
      "OverDue tasks fetched",
    );
    return overDueTasks;
  }

  async getUserWithIdTasks(userId: string) {
    const logger = getLogger();
    let tasks;
    if (!(await this.userRepo.userExistsById(userId))) {
      throw apiError.notfound("user with id");
    }
    try {
      tasks = await this.repo.getUserWithIdTasks(userId);
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw apiError.badRequest("User with this id");
      }
    }

    logger.info(
      { layer: "service", operation: "task.getUserWithIdTasks" },
      "user's task fetched",
    );

    return tasks;
  }

  async getProjectWithIdTasks(projectId: string) {
    const logger = getLogger();
    if (!(await this.projectRepo.projectExistById(projectId))) {
      throw apiError.notfound("Project with id");
    }
    const projectTasks = await this.repo.getProjectWithIdTasks(projectId);
    logger.info(
      { layer: "repository", operation: "task.getProjectWithIdTasks" },
      "Project's tasks fetched",
    );
    return projectTasks;
  }
}
