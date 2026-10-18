import { paginationParams } from "./schema";

export type paginationType = {
  page: number;
  limit: number;
  offset: number;
};

export const getPagination = (params: paginationParams): paginationType => {
  const { page, limit } = params;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};
