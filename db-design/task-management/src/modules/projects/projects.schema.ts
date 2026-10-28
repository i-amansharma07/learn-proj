import { z } from "zod";

const projectStatus = z.enum(["pending", "active", "archived"]);

const projectFields = {
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1).max(50),
  status: projectStatus,
  ownerId: z.uuid(),
};

export const createProjectSchema = z.strictObject({
  name: projectFields.name,
  description: projectFields.description.optional(),
  status: projectFields.status,
  ownerId: projectFields.ownerId,
});

//not having ownership transfer option right
//so no owner_id needed
export const updateProjectShema = z.strictObject({
  name: projectFields.name.optional(),
  description: projectFields.description.optional(),
  status: projectFields.status.optional(),
});

export const projectParamSchema = z.strictObject({
  projectId: z.uuid(),
});

export type CreateProjectDTO = z.infer<typeof createProjectSchema>;
export type UpdateProjectDTO = z.infer<typeof updateProjectShema>;
