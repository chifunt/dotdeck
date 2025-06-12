/**
 * @file User model – low-level DB helpers for the dotdeck_user table.
 */

import { db } from "../config/db.js";

export const UserModel = {
  /**
   * Create a new user.
   * @param {{username:string,email:string,passwordHash:string}} param0
   * @returns {Promise<{id:number,username:string,email:string}>}
   */
  async create({ username, email, passwordHash }) {
    const [r] = await db.query(
      `INSERT INTO dotdeck_user (username, email, password)
       VALUES (?,?,?)`,
      [username, email, passwordHash],
    );
    return { id: r.insertId, username, email };
  },

  /**
   * Fetch full row (including hashed password) by e-mail.
   * @param {string} email
   */
  async findByEmail(email) {
    const [[row]] = await db.query(
      "SELECT * FROM dotdeck_user WHERE email = ?",
      [email],
    );
    return row;
  },

  /**
   * Public-safe fetch (no password) by ID.
   * @param {number} id
   */
  async findById(id) {
    const [[row]] = await db.query(
      "SELECT id, username, email FROM dotdeck_user WHERE id = ?",
      [id],
    );
    return row;
  },
};
