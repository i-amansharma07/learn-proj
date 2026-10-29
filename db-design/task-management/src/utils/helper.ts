export const serialiseError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};
