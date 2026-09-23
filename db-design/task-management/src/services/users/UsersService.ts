import { _UserRepo } from "../../repositories/users/users.repo";

export class _UserService {
  //receive UserRepo
  constructor(private readonly repo: _UserRepo) {}

  async getAllUsers() {
    return await this.repo.getAllUsers();
  }
}
