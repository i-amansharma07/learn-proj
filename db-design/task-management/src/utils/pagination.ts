// import { paginationParams } from "./schema";

export type paginationType = {
  page: number;
  limit: number;
  offset: number;
};

export type paginationResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const getPagination = (params: any): paginationType => {
  const { page, limit } = params;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};
