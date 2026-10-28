export type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: number;
  assigned_to: string;
  project_id: string;
  description?: string;
  due_date?: Date;

  created_at?: Date;
  updated_at?: Date;
};

export type Task = {
  id: string;
  title: string;
  status: string;
  priority: number;
  assignedTo: string;
  projectId: string;
  description?: string;
  dueDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateTask = {
  title: string;
  status: string;
  priority: number;
  assignedTo?: string;
  projectId: string;
  description?: string;
  dueDate?: Date;
};

export type UpdateTask = {
  title?: string;
  status?: string;
  priority?: number;
  assignedTo?: string | null;
  description?: string;
  dueDate?: Date | null;
};
