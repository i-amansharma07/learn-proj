import { _UserService } from "../modules/users/users.service";
import { _UserRepo } from "../modules/users/users.repo";
import { pool } from "../db/pool";
import { _ProjectRepo } from "../modules/projects/projects.repo";
import { _ProjectService } from "../modules/projects/projects.service";
import { _TaskService } from "../modules/tasks/tasks.service";
import { _TaskRepo } from "../modules/tasks/tasks.repo";
//User
const UserRepo = new _UserRepo(pool);
const UserService = new _UserService(UserRepo);

//Project
const ProjectRepo = new _ProjectRepo(pool);
const ProjectService = new _ProjectService(ProjectRepo, UserRepo);

const TaskRepo = new _TaskRepo(pool);
const TaskService = new _TaskService(TaskRepo);

export { UserRepo, UserService, ProjectRepo, ProjectService, TaskService };
