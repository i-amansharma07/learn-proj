import { Request, Response, RequestHandler } from "express";
import { UserService } from "../../container";
const getAllUsers: RequestHandler = async (req, res) => {
  const results = await UserService.getAllUsers();

  return res.json({ results });
};

export { getAllUsers };
