import { Pool } from "pg";
import { NewUser, UpdateUser, User, UserStats, Profile } from "./users.types";
import { ProfileDTO } from "./users.schema";
import { apiError } from "../../utils/apiErrors";
import { serialiseError } from "../../utils/helper";
import { getLogger } from "../../observability/logger";

//private to this file
type UserRow = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
};

type UserProfileRow = {
  age?: string;
  bio?: string;
  phone?: string;
  user_status?: string;
};

//snake to camel case

const toUser = (user: UserRow & UserProfileRow): User => {
  if (user.created_at && user.updated_at) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
  };
};

const toProfileUser = (user: UserRow & UserProfileRow): User & Profile => {
  if (user.created_at && user.updated_at) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      age: user.age,
      bio: user.bio,
      phone: user.phone,
      user_status: user.user_status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    age: user.age,
    bio: user.bio,
    phone: user.phone,
    user_status: user.user_status,
  };
};

const toProfile = (profile: UserProfileRow): Profile => {
  return {
    age: profile.age,
    bio: profile.bio,
    phone: profile.phone,
    user_status: profile.user_status,
  };
};

const userPublicFields = "id, email, full_name, created_at, updated_at";
const profilePublicFiels = "bio, age, phone, user_status";

export class _UserRepo {
  constructor(private readonly db: Pool) {}

  async getAllUsers(
    limit: number,
    offset: number,
    name?: string,
  ): Promise<{ data: User[]; total: number }> {
    const logger = getLogger();
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (name) {
      values.push(`%${name.trim()}%`);
      conditions.push(`full_name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const sortBy = "ORDER BY created_at";
    const sortOrder = "DESC";
    const dbValues = [...values, limit, offset];

    const [userResults, countResults] = await Promise.all([
      this.db.query<UserRow>(
        `SELECT id, email, full_name
        FROM users
        ${whereClause}
        ${sortBy} ${sortOrder}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2};
        `,
        dbValues,
      ),
      this.db.query(
        `SELECT COUNT(*) AS total
         FROM users
         ${whereClause}
        `,
        values,
      ),
    ]);

    const users = userResults.rows.map(toUser);
    const total = Number(countResults.rows[0].total);

    logger.debug(
      { layer: "repository", operation: "getAllUsers", rowsFetched: total },
      "Get all users query executed",
    );

    return { data: users, total };
  }

  //not getting used right now
  async userExistsByMail(userEmail: string): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      `
        SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)
      `,
      [userEmail],
    );

    return rows[0].exists;
  }

  //not getting used right now
  async userExistsById(userId: string): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      `
      SELECT EXISTS(SELECT 1 FROM users WHERE id=$1) AS exists;
      `,
      [userId],
    );

    return rows[0].exists;
  }

  //create user and profile record
  async createUser(data: NewUser): Promise<User> {
    const logger = getLogger();
    const client = await this.db.connect();
    try {
      await client.query(`BEGIN`);
      const { rows } = await client.query<UserRow>(
        `INSERT INTO users (email, full_name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING ${userPublicFields};
        `,
        [data.email, data.fullName, data.passwordHash],
      );

      const user = rows[0];

      //extra safety check
      if (!user) {
        logger.error(
          {
            layer: "repository",
            operation: "user.createUser",
            err: new Error("DB returned zero rows upon user creation"),
          },
          "Db retuned no rows upon creation",
        );
        throw apiError.internal(
          "repo : DB returned zero rows upon user creation",
        );
      }

      await client.query(
        `
        INSERT INTO profiles (user_id)
        VALUES($1);
      `,
        [user.id],
      );

      await client.query(`COMMIT`);

      logger.debug(
        { layer: "repository", operation: "user.createUser" },
        "Create User db query executed",
      );

      return user && toUser(user);
    } catch (err) {
      logger.error(
        {
          layer: "repository",
          operation: "user.createUser",
          err: serialiseError(err),
        },
        "error while creating user",
      );
      try {
        logger.info(
          { layer: "repository", operation: "user.createUser" },
          "Rolling back",
        );
        await client.query(`ROLLBACK`);
      } catch (e) {
        logger.error(
          {
            layer: "repository",
            operation: "user.createUser",
            err: serialiseError(e),
          },
          "Error while rolling backs",
        );
        throw e;
      }
      throw err;
    } finally {
      client.release();
      logger.info(
        { layer: "repository", operation: "user.createUser" },
        "Released db connection",
      );
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    const logger = getLogger();
    const { rows, rowCount } = await this.db.query<UserRow>(
      `
      SELECT ${userPublicFields}
      FROM users
      where id = $1;
      `,
      [userId],
    );

    logger.debug(
      {
        layer: "repository",
        operation: "user.getUserById",
        rowsFetched: rowCount!,
      },
      "getUserById db query executed",
    );

    return rows[0] ? toUser(rows[0]) : null;
  }

  async deleteUserById(userId: string): Promise<number> {
    const logger = getLogger();
    const { rowCount } = await this.db.query(
      `
      DELETE FROM users
      where id = $1
      `,
      [userId],
    );

    logger.debug(
      { layer: "repository", operation: "deleteUserById" },
      "Delete user query executed",
    );

    // 1 means user deleted else not deleted
    return rowCount ?? 0;
  }

  //create trigger for update records

  async updateUserById(userId: string, data: UpdateUser): Promise<User | null> {
    const logger = getLogger();
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

    logger.debug(
      { layer: "repository", operation: "user.updateUserById" },
      "update user query executed",
    );

    return rows[0] ? toUser(rows[0]) : null;
  }

  async getUserStatsById(userId: string): Promise<UserStats[]> {
    const logger = getLogger();
    const { rows } = await this.db.query<UserStats>(
      `
        SELECT
        u.id AS "userId",
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
      LEFT JOIN project_members pm
      on u.id = pm.user_id

      LEFT JOIN tasks t
      on u.id = t.assigned_to

      WHERE u.id = $1
      GROUP BY u.id
      `,
      [userId],
    );
    logger.debug(
      { layer: "repository", operation: "user.getUserStatsById" },
      "user stats query executed",
    );
    return rows;
  }

  //profile

  async getUserProfileById(userId: string): Promise<(User & Profile) | null> {
    const logger = getLogger();
    const { rows } = await this.db.query<UserRow>(
      `
      SELECT ${userPublicFields
        .split(",")
        .map((item) => "u." + item)
        .join(", ")}, ${profilePublicFiels
        .split(",")
        .map((item) => "p." + item)
        .join(", ")}
      FROM users u
      JOIN profiles p
      ON u.id = p.user_id
      WHERE id = $1;
      `,
      [userId],
    );

    logger.debug(
      { layer: "repository", operation: "user.getUserProfileById" },
      "get user profile query executed",
    );
    return rows[0] ? toProfileUser(rows[0]) : null;
  }

  async updateUserWithProfile(
    userId: string,
    data: ProfileDTO,
  ): Promise<Profile | null> {
    const logger = getLogger();
    const fields: string[] = [];
    const values: unknown[] = [];

    let i = 1;
    if (data.age !== undefined) {
      fields.push(`age=$${i++}`);
      values.push(data.age);
    }

    if (data.bio !== undefined) {
      fields.push(`bio=$${i++}`);
      values.push(data.bio);
    }

    if (data.phone !== undefined) {
      fields.push(`phone=$${i++}`);
      values.push(data.phone);
    }
    if (data.user_status !== undefined) {
      fields.push(`user_status=$${i++}`);
      values.push(data.user_status);
    }

    values.push(userId);

    const { rows } = await this.db.query(
      `
        UPDATE profiles
        SET ${fields.join(", ")}
        WHERE user_id = $${i}
        RETURNING ${profilePublicFiels}
      `,
      values,
    );

    logger.debug(
      { layer: "repository", operation: "user.updateUserWithProfile" },
      "User profile update query executed",
    );

    return rows[0] ? toProfile(rows[0]) : null;
  }
}
