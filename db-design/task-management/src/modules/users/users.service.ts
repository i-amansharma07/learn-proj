import { _UserRepo } from "./users.repo";
import { CreateUserInput, NewUser, UpdateUser, UserStats } from "./user.types";
import { apiError } from "../../utils/apiErrors";
import { getPagination } from "../../utils/pagination";
import { ProfileDTO, UserQuery } from "./user.schema";
import { isUniqueViolation } from "../../utils/postgresError";

export class _UserService {
  //receive UserRepo
  constructor(private readonly repo: _UserRepo) {}

  async getAllUsers(params: UserQuery) {
    const { limit, offset, page } = getPagination(params);
    const { name } = params;
    const { data, total } = await this.repo.getAllUsers(limit, offset, name);

    return {
      data: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createUser(data: CreateUserInput) {
    const hashedPass = data.password + "hashed";

    const user: NewUser = {
      email: data.email,
      fullName: data.fullName,
      passwordHash: hashedPass,
    };

    let createdUser;
    try {
      createdUser = await this.repo.createUser(user);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw apiError.conflict(
          "Email already exists, try with some other mail",
        );
      }
    }
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

  //profile

  async getUserProfileById(userId: string) {
    const user = await this.repo.getUserProfileById(userId);
    if (!user) {
      throw apiError.notfound("User Profile with this id don't exists");
    }
    return user;
  }

  async updateUserWithProfile(userId: string, data: ProfileDTO) {
    const profile = await this.repo.updateUserWithProfile(userId, data);

    if (!profile) {
      apiError.notfound("Profile with this user id don't exists");
    }

    return profile;
  }
}
