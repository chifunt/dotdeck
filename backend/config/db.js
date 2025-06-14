/**
 * @file Database connection pool (mysql2/promise)
 */

import mysql from "mysql2/promise";

/** @type {mysql.PoolOptions} */
const poolConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
};

export const db = mysql.createPool(poolConfig);
