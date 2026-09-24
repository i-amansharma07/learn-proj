import { Request, Response, RequestHandler } from "express";
import { UserService } from "../../container";
import { createUserSchema } from "./user.schema";

const getAllUsers: RequestHandler = async (req: Request, res: Response) => {
  const results = await UserService.getAllUsers();

  return res.json({ results });
};

const createUser: RequestHandler = async (req: Request, res: Response) => {
  const body = req.body;
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const user = await UserService.createUser(result.data);

  return res.status(201).json({ user });
};

const getUserById: RequestHandler = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ errors: "user id is not provided" });
  }

  const user = await UserService.getUserById(user_id as string);

  return res.status(200).json({ user });
};

export { getAllUsers, createUser, getUserById };
