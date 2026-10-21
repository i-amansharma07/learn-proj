// import { paginationParams } from "./schema";

export type paginationType = {
  page: number;
  limit: number;
  offset: number;
};

export const getPagination = (params: any): paginationType => {
  const { page, limit } = params;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};
