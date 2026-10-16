import { Pool } from "pg";
import { NewUser, UpdateUser, User, UserStats } from "./user.types";

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

  async getAllUsers(): Promise<User[]> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT *
      FROM users`,
    );
    return rows.map(toUser);
  }

  async userExistsByMail(userEmail: string): Promise<boolean> {
    const { rows } = await this.db.query(
      `
        SELECT id
        FROM users
        WHERE users.email = $1
      `,
      [userEmail],
    );

    return rows.length > 0;
  }

  async userExistsById(userId: string): Promise<boolean> {
    const { rows } = await this.db.query(
      `
        SELECT id
        FROM users
        WHERE users.id = $1
      `,
      [userId],
    );

    return rows.length > 0;
  }

  async createUser(data: NewUser): Promise<User> {
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (email, full_name, password_hash)
      VALUES ($1, $2, $3)
      RETURNING ${userPublicFields};
      `,
      [data.email, data.fullName, data.passwordHash],
    );
    return rows[0] && toUser(rows[0]);
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

  async getUserStatsById(userId: string): Promise<UserStats[]> {
    const { rows } = await this.db.query<UserStats>(
      `
        SELECT
        u.id AS "user_id",
        COUNT(DISTINCT pm.project_id) AS "totalProjects",
        COUNT(DISTINCT t.id) AS "totalTasks",
        COUNT(DISTINCT t.id) FILTER(
        WHERE t.status = 'completed'
        ) AS "completedTasks",
        COUNT (DISTINCT t.id) FILTER (
        WHERE t.status = 'pending'
        ) AS "pendingTasks",
        COUNT (DISTINCT t.id) FILTER (
        WHERE t.status != 'completed'
        AND
        t.due_date < CURRENT_DATE
        ) AS "overdueTasks"

      FROM users u
      left join project_member pm
      on u.id = pm.user_id

      left join tasks t
      on u.id = t.assigned_to

      where u.id = $1
      GROUP BY u.id
      `,
      [userId],
    );

    return rows;
  }
}
