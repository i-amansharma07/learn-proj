import { z } from "zod";

const taskStatus = z.enum(["pending", "in_progress", "completed"]);

const tasksFields = {
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  status: taskStatus,
  priority: z.coerce.number().int().min(1).max(5),
  dueDate: z.coerce.date(),
  assignedTo: z.uuid(),
  projectId: z.uuid(),
};

export const CreateTaskSchema = z.strictObject({
  title: tasksFields.title,
  description: tasksFields.description.optional(),
  status: taskStatus.default("pending"),
  priority: tasksFields.priority.default(1),
  dueDate: tasksFields.dueDate.optional(),
  assignedTo: tasksFields.assignedTo.optional(),
  projectId: tasksFields.projectId,
});

export const UpdateTaskSchema = z.strictObject({
  title: tasksFields.title.optional(),
  description: tasksFields.description.optional(),
  status: tasksFields.status.optional(),
  priority: tasksFields.priority.optional(),
  dueDate: tasksFields.dueDate.optional().nullable(),
  assignedTo: tasksFields.assignedTo.optional().nullable(),
});

export const TaskParamSchema = z.strictObject({
  taskId: z.uuid(),
});

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
