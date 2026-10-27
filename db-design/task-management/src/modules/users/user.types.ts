// domain types (shared by service + repo)

// What the app returns everywhere. No password. camelCase.
export type User = {
  id: string;
  email: string;
  fullName: string;
  createdAt?: Date;
  updatedAt?: Date;
};

//What the service accepts (plain password)
export type CreateUserInput = {
  email: string;
  fullName: string;
  password: string;
};

//repo accepts this
export type NewUser = {
  email: string;
  fullName: string;
  passwordHash: string;
};

//user by service
export type UpdateUser = {
  email?: string;
  fullName?: string;
};

//used by service
export type ListUserInput = {
  name?: string;
  page: number;
  limit: number;
};

export type UserStats = {
  userId: string;
  totalProjects: string;
  totalTasks: string;
  completedTasks: string;
  pendingTasks: string;
  overdueTasks: string;
};

//profile
export type Profile = {
  age?: string;
  phone?: string;
  bio?: string;
  user_status?: string;
};
