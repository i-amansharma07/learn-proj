import { _UserRepo } from "./users.repo";
import { CreateUserInput, NewUser, UpdateUser, UserStats } from "./user.types";
import { apiError } from "../../utils/apiErrors";

export class _UserService {
  //receive UserRepo
  constructor(private readonly repo: _UserRepo) {}

  async getAllUsers() {
    return await this.repo.getAllUsers();
  }

  async createUser(data: CreateUserInput) {
    // check for existing user
    const exists = await this.repo.userExistsByMail(data.email);

    if (exists) {
      throw apiError.conflict("Email already exists");
    }

    const hashedPass = data.password + "hashed";

    const user: NewUser = {
      email: data.email,
      fullName: data.fullName,
      passwordHash: hashedPass,
    };

    const createdUser = await this.repo.createUser(user);
    if (!createdUser) {
      throw apiError.internal();
    }
    return createdUser;
  }

  async getUserById(userId: string) {
    const user = await this.repo.getUserById(userId);
    if (!user) {
      throw apiError.notfound("User with this id");
    }
    return user;
  }

  async deleteUserById(userId: string) {
    const deleteCount = await this.repo.deleteUserById(userId);

    if (deleteCount === 0) {
      throw apiError.notfound("User with this id");
    }
  }

  async updateUserById(userId: string, data: UpdateUser) {
    const user: UpdateUser = {
      email: data.email,
      fullName: data.fullName,
    };

    const updatedUser = await this.repo.updateUserById(userId, user);

    if (!updatedUser) {
      throw apiError.notfound("User with this id");
    }

    return updatedUser;
  }

  async getUserStatsById(userId: string): Promise<UserStats[]> {
    const stats = await this.repo.getUserStatsById(userId);

    if (stats.length === 0) {
      throw apiError.notfound("User with this id");
    }

    return stats;
  }
}
