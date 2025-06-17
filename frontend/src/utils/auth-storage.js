/**
 * @file Thin wrapper around localStorage for JWT persistence.
 * Keeping storage logic in one place simplifies testing & migration.
 */

/** Local-storage key used across the app */
const KEY = "codedeck_token";

/**
 * Read the persisted JWT.
 * @returns {string|null} Raw JWT string or `null` when not set.
 */
export const getToken = () => localStorage.getItem(KEY);

/**
 * Persist / overwrite the JWT.
 * @param {string} token – Bearer token received from the API.
 */
export const setToken = (token) => localStorage.setItem(KEY, token);

/**
 * Delete the stored JWT (e.g. on logout or 401).
 */
export const clearToken = () => localStorage.removeItem(KEY);
