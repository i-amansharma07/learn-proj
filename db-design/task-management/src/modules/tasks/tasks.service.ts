import { CreateTaskDTO, UpdateTaskDTO } from "./tasks.schema";
import { _TaskRepo } from "./tasks.repo";
import { CreateTask, UpdateTask } from "./tasks.types";
import { isForeignKeyViolation } from "../../utils/postgresError";
import { apiError } from "../../utils/apiErrors";

export class _TaskService {
  constructor(private readonly repo: _TaskRepo) {}

  async createTask(data: CreateTaskDTO) {
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

    return task;
  }

  async getTaskById(taskId: string) {
    return await this.repo.getTaskById(taskId);
  }

  async updateTaskById(taskId: string, data: UpdateTaskDTO) {
    const task: UpdateTask = {
      title: data.title,
      description: data.description,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
    };

    const updateTask = await this.repo.updateTaskById(taskId, task);

    return updateTask;
  }

  async deleteTaskById(taskId: string) {
    const rowCount = await this.repo.deleteTaskById(taskId);
    if (rowCount === 0) {
      throw apiError.notfound("Task with this id");
    }
  }

  async getAllOverdueTasks() {
    return await this.repo.getAllOverdueTasks();
  }

  async getUserWithIdTasks(userId: string) {
    let tasks;
    try {
      tasks = await this.repo.getUserWithIdTasks(userId);
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw apiError.badRequest("User with this id");
      }
    }

    return tasks;
  }

  async getProjectWithIdTasks(projectId: string) {
    return await this.repo.getProjectWithIdTasks(projectId);
  }
}
