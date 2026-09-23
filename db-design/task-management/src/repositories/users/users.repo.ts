import { Pool } from "pg";

export class _UserRepo {


  constructor(private readonly db: Pool) {}

  async getAllUsers() {
    const result = await this.db.query("SELECT * FROM users");
    return result.rows;
  }
}
