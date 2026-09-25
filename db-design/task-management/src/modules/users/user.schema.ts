import { email, z } from "zod";

//Zod + DTO (HTTP boundary only)
export const createUserSchema = z.object({
  email: z.email(),
  fullName: z.string().min(1),
  password: z.string().min(8).max(10),
});

export const updateUserSchema = z.object({
  email: z.email().optional(),
  fullName: z.string().optional(),
});

/*
CreateUserDto has the same shape as CreateUserInput,
so TypeScript lets you pass one where the other is expected.
They're still separate types because they change for different reasons.
The DTO changes when your
API contract changes, and the service input changes when business logic changes.
*/

export type CreateUserDTO = z.infer<typeof createUserSchema>;
