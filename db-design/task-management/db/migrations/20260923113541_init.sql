-- migrate:up
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE project_status AS ENUM ('pending', 'active', 'archived');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE user_status AS ENUM ('Focus', 'BRB', 'sick', 'AFK');


CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NUll,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 1 <-> 1 with user's table - 1 user can have at most 1 profile (extension table)
CREATE TABLE profiles(
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    phone TEXT,
    user_status user_status,
    age SMALLINT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 1 <--> many with users - 1 user can have many projects and one project can have one user as owner
CREATE TABLE projects(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'active',
    owner_id UUID NOT NULL  REFERENCES users(id) ON DELETE RESTRICT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



--Junction table for users and projects many to many relation
-- 1 user <----> many projects and 1 project <----> users [many to many relationship bw users and projects so needed this junction table]
CREATE TABLE project_members(
    project_id UUID NOT NULL REFERENCES projects(id) on DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) on DELETE CASCADE,
    role member_role NOT NUll DEFAULT 'member',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(project_id, user_id)
);


-- 1<---> many with users (one user can have many tasks) and 1 <----> many with projects (one project can have many tasks)
CREATE TABLE tasks(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    priority SMALLINT NOT NULL DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    due_date DATE,

    assigned_to UUID  REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- only the memeber of the project can be assigned task of that project
    CONSTRAINT tasks_assignee_is_project_member_fkey
    FOREIGN KEY (project_id, assigned_to)
    REFERENCES project_members (project_id, user_id)
    ON DELETE SET NULL (assigned_to),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- migrate:down
