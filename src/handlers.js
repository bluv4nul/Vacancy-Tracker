import { pool } from "./db.js";

export const home = (req, res) =>
  res.json({
    message: "Welcome to my project!",
    status: "In progress",
  });

export const healthCheck = async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.send(result.rows);
};
