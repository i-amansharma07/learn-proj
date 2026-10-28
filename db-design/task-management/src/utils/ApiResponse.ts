import { paginationResponse } from "./pagination";

export class ApiResponse<T> {
  private readonly success: boolean;
  private readonly message: string;
  private readonly data: T;
  private readonly pagination?: paginationResponse;

  constructor(
    data: T,
    message = "Success",
    status = 200,
    pagination?: paginationResponse,
  ) {
    this.success = status < 400;
    this.data = data;
    this.message = message;
    if (pagination !== undefined) this.pagination = pagination;
  }
}
