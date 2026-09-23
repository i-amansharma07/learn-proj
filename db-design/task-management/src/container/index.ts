import { _UserService } from "../services/users/UsersService";
import { _UserRepo } from "../repositories/users/users.repo";
import { pool } from "../db/pool";

const UserRepo = new _UserRepo(pool);
const UserService = new _UserService(UserRepo);


export { UserRepo, UserService };
