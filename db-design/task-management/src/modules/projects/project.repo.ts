import { Pool } from "pg";
import {
  CreateProject,
  ProjectRow,
  Project,
  UpdateProject,
} from "./project.types";
import { apiError } from "../../utils/apiErrors";

const projectPublicFields = `id, name, status, owner_id, description, created_at, updated_at`;

const toProject = (project: ProjectRow): Project => {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    ownerId: project.owner_id,
  };
};

export class _ProjectRepo {
  constructor(private readonly db: Pool) {}

  async createProjectWithOwner(project: CreateProject): Promise<Project> {
    const client = await this.db.connect();
    const values = [
      project.name,
      project.status,
      project.owner_id,
      project.description ?? null,
    ];
    try {
      await client.query(`BEGIN`);

      const { rows } = await client.query<ProjectRow>(
        `
        INSERT INTO projects(name, status, owner_id, description)
        VALUES ($1, $2, $3, $4)
        RETURNING ${projectPublicFields};
        `,
        values,
      );

      const row = rows[0];
      if (!row) {
        throw apiError.internal("repo : Failed to create Project in repo");
      }

      await client.query(
        `
        INSERT INTO project_members(project_id, user_id, role)
        VALUES ($1, $2, $3);
        `,
        [row.id, row.owner_id, "owner"],
      );

      await client.query(`COMMIT`);

      return toProject(row);
    } catch (err) {
      try {
        await client.query(`ROLLBACK`);
      } catch (e) {
        console.log("Transaction rollback failed while creating project", e);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  async getProjectById(projectId: string): Promise<Project> {
    const { rows } = await this.db.query<ProjectRow>(
      `
      SELECT ${projectPublicFields}
      FROM projects
      WHERE id = $1;
      `,
      [projectId],
    );

    const row = rows[0];

    if (!row) {
      throw apiError.internal("Error while getting project By Id");
    }

    return toProject(row);
  }

  async getAllProjects(): Promise<Project[]> {
    const { rows } = await this.db.query<ProjectRow>(`
      SELECT id, name, status, description, owner_id
      FROM projects
      `);

    return rows.map((rec) => toProject(rec));
  }

  async updateProjectById(
    projectId: string,
    data: UpdateProject,
  ): Promise<Project | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    let i = 1;
    if (data.name) {
      fields.push(`name = $${i++}`);
      values.push(data.name);
    }

    if (data.description) {
      fields.push(`description = $${i++}`);
      values.push(data.description);
    }

    if (data.status) {
      fields.push(`status = $${i++}`);
      values.push(data.status);
    }

    values.push(projectId);

    const { rows, rowCount } = await this.db.query<ProjectRow>(
      `
      UPDATE projects
      SET ${fields.join(", ")}
      WHERE id = $${i}
      RETURNING ${projectPublicFields}
      `,
      values,
    );

    if (rowCount === 0) return null;

    const row = rows[0];

    //make this better like there can be multiple errors thrown by db i am only considering
    //projectId not found usecase(returning null for that only)
    return row ? toProject(row) : null;
  }

  async deleteProjectById(projectId: string): Promise<number> {
    const { rowCount } = await this.db.query(
      `
      DELETE FROM projects
      WHERE id = $1;
      `,
      [projectId],
    );

    return rowCount ?? 0;
  }

  async getUsersProjectsByUserId(userId: string): Promise<Project[]> {
    const { rows } = await this.db.query<ProjectRow>(
      `
      SELECT ${projectPublicFields
        .split(",")
        .map((item) => `p.${item}`)
        .join(", ")}
      FROM project_members pm
      JOIN projects p
      on pm.project_id = p.id
      WHERE pm.user_id = $1
      ORDER BY p.created_at DESC, p.id DESC;
      `,
      [userId],
    );

    return rows.map((p) => toProject(p));
  }
}
