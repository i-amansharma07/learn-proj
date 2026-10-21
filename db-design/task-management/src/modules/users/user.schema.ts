import { z } from "zod";

//Zod + DTO (HTTP boundary only)
const userFileds = {
  email: z.string().trim().toLowerCase().pipe(z.email()),
  fullName: z.string().trim().min(1).max(100),
};

export const createUserSchema = z.object({
  email: userFileds.email,
  fullName: userFileds.fullName,
  password: z.string().min(8).max(28),
});

export const updateUserSchema = z.strictObject({
  email: userFileds.email.optional(),
  fullName: userFileds.fullName.optional(),
});

//inside the url
export const userParamSchema = z.strictObject({
  user_id: z.uuid(),
});

//insdie the query params
export const userQuerySchema = z.strictObject({
  name: z.string().min(1).max(50).optional(),
  page: z.coerce.number().min(1).max(100).default(1),
  limit: z.coerce.number().min(1).max(20).default(10),
});

/*
The DTO changes when your
API contract changes, and the service input changes when business logic changes.
*/

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;

//profile
const UserStatus = z.enum(["Focus", "Brb", "sick", "AFK"]);

export const profileFields = {
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number")
    .optional(),
  userStatus: UserStatus.optional(),
  age: z.number().min(12).optional(),
  bio: z.string().trim().min(1).max(100).optional(),
};

export const UpsertProfileSchema = z.object({
  phone: profileFields.phone,
  user_status: profileFields.userStatus,
  age: profileFields.age,
  bio: profileFields.bio,
});

export type ProfileDTO = z.infer<typeof UpsertProfileSchema>;
