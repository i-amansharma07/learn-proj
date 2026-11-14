-- migrate:up

CREATE TABLE repositories(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    default_branch TEXT NOT NULL,

    latest_commit_sha TEXT NOT NULL,
    indexed_commit_sha TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),


    CONSTRAINT repo_owner_name_unique
        UNIQUE(owner, name)
);


CREATE TABLE files(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NUll,
    blob_sha TEXT NOT NULL,
    language TEXT NOT NULL,

    repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
    size INTEGER NOT NULL,
    last_ingested_at TIMESTAMPTZ,

    CONSTRAINT repo_file_path_unique
        UNIQUE(repo_id, path)
);

CREATE TABLE repository_chunks(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    chunk_id TEXT NOT NULL,

    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,


    embeddings VECTOR(384) NOT NULL,

    CONSTRAINT repository_chunks_id_unique
       UNIQUE (file_id, chunk_id),

    CONSTRAINT repository_chunks_valid_lines
       CHECK (start_line > 0 AND end_line >= start_line)

);



-- migrate:down
