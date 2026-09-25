import { _UserRepo } from "./users.repo";
import { CreateUserInput, NewUser, UpdateUser } from "./user.types";

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

  async deleteUserById(userId: string) {
    const deleteCount = await this.repo.deleteUserById(userId);

    if (deleteCount === 0) {
      return null;
    }

    return {};
  }

  async updateUserById(userId: string, data: UpdateUser) {
    const user: UpdateUser = {
      email: data.email,
      fullName: data.fullName,
    };

    const updatedUser = await this.repo.updateUserById(userId, user);

    if (!updatedUser) return null;

    return updatedUser;
  }
}
