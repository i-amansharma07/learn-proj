import { Pool } from "pg";
import { CreateTask, Task, TaskRow, UpdateTask } from "./tasks.types";
import { apiError } from "../../utils/apiErrors";

const taskPublicFields = `id, title, description, status, priority, due_date, assigned_to, project_id`;

const toTask = (task: TaskRow): Task => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.due_date,
    projectId: task.project_id,
    assignedTo: task.assigned_to,
    status: task.status,
  };
};

export class _TaskRepo {
  constructor(private readonly db: Pool) {}

  async createTask(task: CreateTask) {
    const values = [
      task.title,
      task.description ?? null,
      task.status,
      task.priority,
      task.dueDate ?? null,
      task.assignedTo ?? null,
      task.projectId,
    ];
    const { rows } = await this.db.query<TaskRow>(
      `
      INSERT INTO tasks(title, description, status, priority, due_date, assigned_to, project_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${taskPublicFields};
      `,
      values,
    );

    return toTask(rows[0]);
  }

  async getTaskById(taskId: string): Promise<Task> {
    const { rowCount, rows } = await this.db.query<TaskRow>(
      `SELECT ${taskPublicFields} FROM tasks  WHERE id=$1`,
      [taskId],
    );

    if (rowCount === 0) {
      throw apiError.notfound("Task with this id");
    }

    return toTask(rows[0]);
  }

  async updateTaskById(taskId: string, data: UpdateTask): Promise<Task | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    let i = 1;
    if (data.title !== undefined) {
      fields.push(`title = $${i++}`);
      values.push(data.title);
    }

    if (data.description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }

    if (data.assignedTo !== undefined) {
      fields.push(`assigned_to = $${i++}`);
      values.push(data.assignedTo);
    }

    if (data.dueDate !== undefined) {
      fields.push(`due_date = $${i++}`);
      values.push(data.dueDate);
    }

    if (data.priority !== undefined) {
      fields.push(`priority = $${i++}`);
      values.push(data.priority);
    }

    if (data.status !== undefined) {
      fields.push(`status = $${i++}`);
      values.push(data.status);
    }

    if (fields.length === 0) {
      throw apiError.badRequest("repo : No Field passes to update task");
    }

    values.push(taskId);

    const { rows } = await this.db.query(
      `
      UPDATE tasks
      SET ${fields.join(", ")}
      WHERE id = $${i}
      RETURNING ${taskPublicFields};
      `,
      values,
    );

    return rows[0] ? toTask(rows[0]) : null;
  }

  async deleteTaskById(taskId: string): Promise<number> {
    const { rowCount } = await this.db.query<TaskRow>(
      `DELETE FROM tasks WHERE id = $1`,
      [taskId],
    );

    return rowCount ?? 0;
  }

  async getAllOverdueTasks(): Promise<Task[]> {
    const { rows } = await this.db.query(`
      SELECT ${taskPublicFields}
      FROM tasks
      WHERE due_date < CURRENT_DATE
      AND status != 'completed';
      `);

    return rows.map((t) => toTask(t));
  }

  async getUserWithIdTasks(userId: string): Promise<Task[]> {
    const { rows } = await this.db.query<TaskRow>(
      `
      SELECT ${taskPublicFields}
      FROM tasks
      WHERE assigned_to = $1;
      `,
      [userId],
    );

    return rows.map((t) => toTask(t));
  }

  async getProjectWithIdTasks(projectId: string): Promise<Task[]> {
    const { rows } = await this.db.query<TaskRow>(
      `
      SELECT ${taskPublicFields}
      FROM tasks
      WHERE project_id = $1;
      `,
      [projectId],
    );
    return rows.map((t) => toTask(t));
  }
}
