import z from "zod";

type pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: pagination;
};

//export type paginationParams = z.infer<typeof paginationSchema>;

//TODO: Add sorting later
//sorting
export const sortSchema = z.object({
  sortBy: z.string().min(1).max(50).optional(),
  order: z.string().min(1).max(50).optional(),
});
