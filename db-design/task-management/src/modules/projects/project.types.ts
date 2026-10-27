//db record type
enum projectStatus {
  active = "active",
  pending = "pending",
  archived = "archived",
}

//for db
export type ProjectRow = {
  id: string;
  name: string;
  description: string;
  status: projectStatus;
  owner_id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProjectMember = {
  project_id: string;
  user_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
};

//for sending to client
export type Project = {
  id: string;
  name: string;
  description: string;
  status: projectStatus;
  ownerId: string;
};

export type CreateProject = {
  name: string;
  status: string;
  description?: string;
  owner_id: string;
};

export type UpdateProject = {
  name?: string;
  status?: string;
  description?: string;
};

export type meta = {
  name: string;
  status: projectStatus;
  ownerId: string;
  description?: string;
};

export type stats = {
  totalMembers: number;
  totalTasks: number;
  totalPendingTasks: number;
  totalInProgressTasks: number;
  totalCompletedTasks: number;
  totalOverdueTasks: number;
};

export type ProjectStats = {
  meta: meta;
  stats: stats;
};
