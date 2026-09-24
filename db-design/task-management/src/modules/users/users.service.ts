import { _UserRepo } from "./users.repo";
import { CreateUserInput, NewUser } from "./user.types";

export class _UserService {
  //receive UserRepo
  constructor(private readonly repo: _UserRepo) {}

  async getAllUsers() {
    return await this.repo.getAllUsers();
  }

  async createUser(data: CreateUserInput) {
    const hashedPass = data.password + "hashed";

    const user: NewUser = {
      email: data.email,
      fullName: data.fullName,
      passwordHash: hashedPass,
    };

    return await this.repo.createUser(user);
  }

  async getUserById(userId: string) {
    return await this.repo.getUserById(userId);
  }
}
