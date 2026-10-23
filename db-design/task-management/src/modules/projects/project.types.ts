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
