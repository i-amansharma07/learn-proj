import { Pool } from "pg";
import {
  CreateProject,
  ProjectRow,
  Project,
  UpdateProject,
  ProjectStats,
  meta,
  stats,
} from "./projects.types";
import { apiError } from "../../utils/apiErrors";
import { getLogger } from "../../observability/logger";
import { serialiseError } from "../../utils/helper";

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

const toProjectStats = (stats: meta & stats): ProjectStats => {
  const metaData = {
    name: stats.name,
    ownerId: stats.ownerId,
    status: stats.status,
    description: stats.description,
  };

  const projectStats = {
    totalMembers: stats.totalMembers,
    totalTasks: stats.totalTasks,
    totalPendingTasks: stats.totalPendingTasks,
    totalInProgressTasks: stats.totalInProgressTasks,
    totalCompletedTasks: stats.totalCompletedTasks,
    totalOverdueTasks: stats.totalOverdueTasks,
  };

  return {
    meta: metaData,
    stats: projectStats,
  };
};

export class _ProjectRepo {
  constructor(private readonly db: Pool) {}

  async createProjectWithOwner(project: CreateProject): Promise<Project> {
    const logger = getLogger();
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

      logger.debug(
        {
          layer: "repository",
          operation: "project.createProjectWithOwner",
        },
        "create project query executed",
      );

      return toProject(row);
    } catch (err) {
      logger.error(
        {
          layer: "repository",
          operation: "project.createProjectWithOwner",
          err: serialiseError(err),
        },
        "error while creating project",
      );
      try {
        await client.query(`ROLLBACK`);
        logger.debug(
          { layer: "repository", operation: "project.createProjectWithOwner" },
          "Rolled back",
        );
      } catch (e) {
        logger.error(
          {
            layer: "repository",
            operation: "project.createProjectWithOwner",
            err: serialiseError(e),
          },
          "Error while rolling back",
        );
        throw e;
      }
      throw err;
    } finally {
      client.release();
      logger.debug(
        { layer: "repository", operation: "project.createProjectWithOwner" },
        "Released db connection",
      );
    }
  }

  async getProjectById(projectId: string): Promise<Project> {
    const logger = getLogger();
    const { rowCount, rows } = await this.db.query<ProjectRow>(
      `
      SELECT ${projectPublicFields}
      FROM projects
      WHERE id = $1;
      `,
      [projectId],
    );

    if (rowCount === 0) {
      throw apiError.notfound("Project with this id");
    }

    logger.debug(
      { layer: "repository", operation: "project.getProjectById" },
      "Project fetched by id query executed",
    );

    return toProject(rows[0]);
  }

  async getAllProjects(): Promise<Project[]> {
    const logger = getLogger();
    const { rows } = await this.db.query<ProjectRow>(`
      SELECT id, name, status, description, owner_id
      FROM projects
      `);

    logger.debug(
      { layer: "repository", operation: "project.getAllProjects" },
      "All Projects query executed",
    );

    return rows.map((rec) => toProject(rec));
  }

  async updateProjectById(
    projectId: string,
    data: UpdateProject,
  ): Promise<Project | null> {
    const logger = getLogger();
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

    logger.debug(
      { layer: "repository", operation: "project.updateProjectById" },
      "Project updated by id query executed",
    );

    //make this better like there can be multiple errors thrown by db i am only considering
    //projectId not found usecase(returning null for that only)
    return row ? toProject(row) : null;
  }

  async deleteProjectById(projectId: string): Promise<number> {
    const logger = getLogger();
    const { rowCount } = await this.db.query(
      `
      DELETE FROM projects
      WHERE id = $1;
      `,
      [projectId],
    );

    logger.debug(
      { layer: "repository", operation: "project.deleteProjectById" },
      "Project deleted by id query executed",
    );

    return rowCount ?? 0;
  }

  async getUsersProjectsByUserId(userId: string): Promise<Project[]> {
    const logger = getLogger();
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

    logger.debug(
      { layer: "repository", operation: "project.getUsersProjectsByUserId" },
      "user's project query executed",
    );

    return rows.map((p) => toProject(p));
  }

  async projectExistById(projectId: string): Promise<boolean> {
    const logger = getLogger();
    const { rows } = await this.db.query(
      `
      SELECT EXISTS(SELECT 1 FROM projects WHERE id=$1) AS exists;
      `,
      [projectId],
    );

    logger.debug(
      { layer: "repository", operation: "project.projectExistById" },
      "Project exists by id query executed",
    );

    return rows[0].exists;
  }

  //test this end point after implementing Tasks
  async getProjectStatsById(projectId: string): Promise<ProjectStats | null> {
    const logger = getLogger();
    const { rows } = await this.db.query(
      `
      SELECT p.name, p.status, p.owner_id AS "ownerId", p.description,
        COUNT(DISTINCT pm.user_id) AS "totalMembers",
        COUNT(DISTINCT t.id) AS "totalTasks",
        COUNT (DISTINCT t.id) FILTER (
        WHERE t.status = 'pending'
        ) AS "totalPendingTasks",
        COUNT (DISTINCT t.id) FILTER (
        WHERE t.status = 'in_progress'
        ) AS "totalInProgressTasks",
        COUNT(DISTINCT t.id) FILTER(
        WHERE t.status = 'completed'
        ) AS "totalCompletedTasks",
        COUNT (DISTINCT t.id) FILTER (
        WHERE t.status != 'completed'
        AND
        t.due_date < CURRENT_DATE
        ) AS "totalOverdueTasks"


        FROM projects p
        LEFT JOIN tasks t
        on p.id = t.project_id

        LEFT JOIN project_members pm
        on p.id = pm.project_id


        WHERE p.id = $1
        GROUP BY p.id;
      `,
      [projectId],
    );

    logger.debug(
      { layer: "repository", operation: "project.getProjectStatsById" },
      "project stats query executed",
    );

    return rows[0] ? toProjectStats(rows[0]) : null;
  }
}
