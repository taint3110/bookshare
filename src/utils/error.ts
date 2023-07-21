export function handleError(
  error: Error,
  filePath: string,
  functionName: string,
  keepThrowing = false,
): void {
  const errorPath = `Error: ${filePath} -> ${functionName} -> error -> `;
  console.error(errorPath, error);
  console.error(errorPath, JSON.stringify(error));

  if (keepThrowing) {
    throw error;
  }
}
