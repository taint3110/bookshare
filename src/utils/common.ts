export function getValidArray<T>(array?: T[]): T[] {
  if (array === undefined) {
    return [];
  }
  return Array.isArray(array) ? array : [];
}

export function isNotEmptyArray(array: unknown[]): boolean {
  return array ? Array.isArray(array) && array.length > 0 : false;
}
