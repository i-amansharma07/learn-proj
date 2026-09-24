// domain types (shared by service + repo)

// What the app returns everywhere. No password. camelCase.
export type User = {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
};

//What the service accepts (plain password)
export type CreateUserInput = {
  email: string;
  fullName: string;
  password: string;
};

export type NewUser = {
  email: string;
  fullName: string;
  passwordHash: string;
};
