export class ApiResponse<T> {
  private readonly success: boolean;
  private readonly message: string;
  private readonly data: T;

  constructor(data: T, message = "Success", status = 200) {
    this.success = status < 400;
    this.data = data;
    this.message = message;
  }
}
