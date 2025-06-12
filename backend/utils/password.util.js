/**
 * @file Hash / compare helpers for passwords.
 */

import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password.
 * @param {string} plain
 * @returns {Promise<string>}
 */
export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

/**
 * Compare a plaintext password with its hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
