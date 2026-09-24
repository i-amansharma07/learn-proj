import { Pool } from "pg";
import { NewUser, User } from "./user.types";

//private to this file
type UserRow = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

//snake to camel case
const toUser = (user: UserRow) : User => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

const userPublicFields = "id, email, full_name, created_at, updated_at";

export class _UserRepo {
  constructor(private readonly db: Pool) {}

  async getAllUsers(): Promise<User[]> {
    const result = await this.db.query<UserRow>(
      `SELECT *
      FROM users`,
    );
    return result.rows.map(toUser)
  }

  async createUser(data: NewUser): Promise<User> {
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (email, full_name, password_hash)
      VALUES ($1, $2, $3)
      RETURNING ${userPublicFields};
      `,
      [data.email, data.fullName, data.passwordHash],
    );
    return toUser(rows[0]);
  }

  async getUserById(userId: string): Promise<User> {
    const { rows } = await this.db.query<UserRow>(
      `
      SELECT ${userPublicFields}
      FROM users
      where id = $1;
      `,
      [userId],
    );

    return toUser(rows[0]);
  }
}

/**** LATER ***/
// catch(err: any) {
//       // 23505 = Postgres unique_violation (email column is UNIQUE)
//       if (err.code === "23505") throw new ConflictError("Email already in use");
//       throw err;
//     }
//   }
