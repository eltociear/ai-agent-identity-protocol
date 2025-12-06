/**
 * API Response Helpers
 *
 * Standardized response utilities for consistent API responses.
 */

import type { Context } from 'hono';
import type { ApiResponse } from '../types/index.js';

/**
 * Create a success response
 */
export function successResponse<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json<ApiResponse<T>>({
    success: true,
    data,
  }, status);
}

/**
 * Create an error response
 */
export function errorResponse(
  c: Context,
  error: string,
  status: 400 | 401 | 403 | 404 | 500 = 500
) {
  return c.json<ApiResponse<null>>({
    success: false,
    error,
  }, status);
}

/**
 * Common error responses
 */
export const errors = {
  notFound: (c: Context, resource = 'Resource') =>
    errorResponse(c, `${resource} not found`, 404),

  badRequest: (c: Context, message: string) =>
    errorResponse(c, message, 400),

  unauthorized: (c: Context, message = 'Unauthorized') =>
    errorResponse(c, message, 401),

  forbidden: (c: Context, message = 'Forbidden') =>
    errorResponse(c, message, 403),

  serverError: (c: Context, message = 'Internal server error') =>
    errorResponse(c, message, 500),
};
