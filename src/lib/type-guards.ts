export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function hasProperty<T extends PropertyKey>(
  obj: object,
  prop: T
): obj is Record<T, unknown> {
  return prop in obj;
}

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  if (!isObject(value)) return false;
  if (!hasProperty(value, 'error') || !isString(value.error)) return false;
  if (hasProperty(value, 'code') && !isString(value.code)) return false;
  return true;
}

export interface APIError extends Error {
  status?: number;
  code?: string;
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof Error;
}