/**
 * API Client - Shared utilities for making API requests
 * Provides a type-safe wrapper around fetch with consistent error handling
 */

/** Result type for API requests with discriminated union for type narrowing */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Generic API request handler with consistent error handling
 * @param url - The URL to fetch
 * @param options - Optional fetch options (method, body, headers, etc.)
 * @returns A discriminated union result for easy type narrowing
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
