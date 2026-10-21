
type PostgresError = {
  code: string;
};

export function isPostgresError(
  error: unknown
): error is PostgresError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

export function isForeignKeyViolation(error: unknown): boolean {
  return isPostgresError(error) && error.code === "23503";
}

export function isUniqueViolation(error: unknown): boolean {
  return isPostgresError(error) && error.code === "23505";
}

export function isNotNullViolation(error: unknown): boolean {
  return isPostgresError(error) && error.code === "23502";
}

export function isCheckViolation(error: unknown): boolean {
  return isPostgresError(error) && error.code === "23514";
}

export function isInvalidTextRepresentation(error: unknown): boolean {
  return isPostgresError(error) && error.code === "22P02";
}

export function isSerializationFailure(error: unknown): boolean {
  return isPostgresError(error) && error.code === "40001";
}

export function isDeadlockDetected(error: unknown): boolean {
  return isPostgresError(error) && error.code === "40P01";
}

export function isQueryCanceled(error: unknown): boolean {
  return isPostgresError(error) && error.code === "57014";
}
