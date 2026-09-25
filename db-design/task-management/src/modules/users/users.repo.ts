import { Pool } from "pg";
import { NewUser, UpdateUser, User } from "./user.types";

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
const toUser = (user: UserRow): User => {
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

  async getAllUsers(): Promise<User[] | null> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT *
      FROM users`,
    );
    return rows.map(toUser);
  }

  async createUser(data: NewUser): Promise<User | null> {
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (email, full_name, password_hash)
      VALUES ($1, $2, $3)
      RETURNING ${userPublicFields};
      `,
      [data.email, data.fullName, data.passwordHash],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const { rows } = await this.db.query<UserRow>(
      `
      SELECT ${userPublicFields}
      FROM users
      where id = $1;
      `,
      [userId],
    );

    return rows[0] ? toUser(rows[0]) : null;
  }

  async deleteUserById(userId: string): Promise<number> {
    const { rowCount } = await this.db.query(
      `
      DELETE FROM users
      where id = $1
      `,
      [userId],
    );

    // 1 means user deleted else not deleted
    return rowCount ?? 0;
  }

  //create trigger for update records
  async updateUserById(userId: string, data: UpdateUser): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (data.email !== undefined) {
      fields.push(`email = $${i++}`);
      values.push(data.email);
    }

    if (data.fullName !== undefined) {
      fields.push(`full_name = $${i++}`);
      values.push(data.fullName);
    }

    values.push(userId);

    const { rows } = await this.db.query<UserRow>(
      `
      UPDATE users
      SET ${fields.join(", ")}
      where id = $${i}
      RETURNING ${userPublicFields}
      `,
      values,
    );

    return rows[0] ? toUser(rows[0]) : null;
  }
}

/**** LATER ***/
// catch(err: any) {
//       // 23505 = Postgres unique_violation (email column is UNIQUE)
//       if (err.code === "23505") throw new ConflictError("Email already in use");
//       throw err;
//     }
//   }
