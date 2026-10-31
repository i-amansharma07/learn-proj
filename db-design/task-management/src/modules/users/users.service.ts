import { _UserRepo } from "./users.repo";
import { CreateUserInput, NewUser, UpdateUser, UserStats } from "./users.types";
import { apiError } from "../../utils/apiErrors";
import { getPagination } from "../../utils/pagination";
import { ProfileDTO, UserQuery } from "./users.schema";
import { isUniqueViolation } from "../../utils/postgresError";
import { getLogger } from "../../observability/logger";

export class _UserService {
  //receive UserRepo
  constructor(private readonly repo: _UserRepo) {}

  async getAllUsers(params: UserQuery) {
    const logger = getLogger();
    const { limit, offset, page } = getPagination(params);
    const { name } = params;
    const { data, total } = await this.repo.getAllUsers(limit, offset, name);

    logger.info(
      {
        layer: "service",
        operation: "user.getAllUsers",
        page,
        limit,
        totalUser: total,
      },
      "All Users fetched",
    );

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
    const logger = getLogger();
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
        logger.warn(
          {
            layer: "service",
            operation: "user.createUser",
            reason: "duplicate_email",
          },
          "conflicting email",
        );
        throw apiError.conflict(
          "Email already exists, try with some other mail",
        );
      }
      throw err;
    }
    if (!createdUser) {
      throw apiError.internal("Something went wrong while creating user");
    }

    logger.info(
      {
        layer: "service",
        operation: "user.createUser",
        userId: createdUser.id,
      },
      "User Created",
    );

    return createdUser;
  }

  async getUserById(userId: string) {
    const logger = getLogger();
    const user = await this.repo.getUserById(userId);
    if (!user) {
      throw apiError.notfound("User with this id");
    }

    logger.info(
      { layer: "service", operation: "user.getUserById" },
      "user with id fetched",
    );
    return user;
  }

  async deleteUserById(userId: string) {
    const logger = getLogger();
    const deleteCount = await this.repo.deleteUserById(userId);

    if (deleteCount === 0) {
      throw apiError.notfound("User with this id");
    }

    logger.info(
      { layer: "service", operation: "user.deleteUserById" },
      "user deleted by Id",
    );
  }

  async updateUserById(userId: string, data: UpdateUser) {
    const logger = getLogger();
    const user: UpdateUser = {
      email: data.email,
      fullName: data.fullName,
    };

    const updatedUser = await this.repo.updateUserById(userId, user);

    if (!updatedUser) {
      throw apiError.notfound("User with this id");
    }

    logger.info(
      { layer: "service", operation: "user.updateUserById" },
      "User updated by Id",
    );

    return updatedUser;
  }

  async getUserStatsById(userId: string): Promise<UserStats[]> {
    const logger = getLogger();
    const stats = await this.repo.getUserStatsById(userId);

    if (stats.length === 0) {
      throw apiError.notfound("User with this id");
    }

    logger.info(
      { layer: "service", operation: "user.getUserStatsById" },
      "user stats fetched by id",
    );

    return stats;
  }

  //profile

  async getUserProfileById(userId: string) {
    const logger = getLogger();
    const user = await this.repo.getUserProfileById(userId);
    if (!user) {
      throw apiError.notfound("User Profile with this id don't exists");
    }

    logger.info(
      { layer: "service", operation: "user.getUserProfileById" },
      "User profile fetched",
    );
    return user;
  }

  async updateUserWithProfile(userId: string, data: ProfileDTO) {
    const logger = getLogger();
    const profile = await this.repo.updateUserWithProfile(userId, data);

    if (!profile) {
      throw apiError.notfound("Profile with this user id don't exists");
    }

    logger.info(
      { layer: "service", operation: "user.updateUserWithProfile" },
      "User profile updated",
    );

    return profile;
  }
}
