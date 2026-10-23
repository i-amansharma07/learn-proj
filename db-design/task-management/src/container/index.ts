import { _UserService } from "../modules/users/users.service";
import { _UserRepo } from "../modules/users/users.repo";
import { pool } from "../db/pool";
import { _ProjectRepo } from "../modules/projects/project.repo";
import { _ProjectService } from "../modules/projects/project.service";

//User
const UserRepo = new _UserRepo(pool);
const UserService = new _UserService(UserRepo);

//Project
const ProjectRepo = new _ProjectRepo(pool);
const ProjectService = new _ProjectService(ProjectRepo);

export { UserRepo, UserService, ProjectRepo, ProjectService };
