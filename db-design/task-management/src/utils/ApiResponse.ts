export class ApiResponse<T> {
  private readonly success: boolean;
  private readonly message: string;
  private readonly data: T;

  constructor(data: T, message = "Success") {
    this.success = true;
    this.data = data;
    this.message = message;
  }
}
