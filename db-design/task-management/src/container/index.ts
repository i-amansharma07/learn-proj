import { _UserService } from "../modules/users/users.service";
import { _UserRepo } from "../modules/users/users.repo";
import { pool } from "../db/pool";

const UserRepo = new _UserRepo(pool);
const UserService = new _UserService(UserRepo);

export { UserRepo, UserService };
