import { PaginationResults } from "./schema";

export class ApiResponse<T> {
  private readonly success: boolean;
  private readonly message: string;
  private readonly pagination?: PaginationResults;
  private readonly data: T;

  constructor(
    data: T,
    message = "Success",
    status = 200,
    pagination?: PaginationResults,
  ) {
    this.success = status < 400;
    this.data = data;
    this.message = message;
    if (pagination) this.pagination = pagination;
  }
}
