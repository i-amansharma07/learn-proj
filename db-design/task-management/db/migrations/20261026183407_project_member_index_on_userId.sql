-- migrate:up
CREATE INDEX idx_project_members_user_id_project_id
ON project_members (user_id, project_id);


-- migrate:down
DROP INDEX IF EXISTS idx_project_members_user_id_project_id;
