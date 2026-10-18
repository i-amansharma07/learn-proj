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
