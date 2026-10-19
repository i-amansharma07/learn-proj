import z from "zod";

//pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginatedResult<T> = {
  data: T[];
  total: number;
};

export type PaginationResults = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type paginationParams = z.infer<typeof paginationSchema>;

//TODO: Add sorting later
//sorting

export const sortSchema = z.object({
  sortBy: z.string().min(1).max(50).optional(),
  order: z.string().min(1).max(50).optional(),
});
