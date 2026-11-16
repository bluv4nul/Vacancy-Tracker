import { prisma } from "../prisma.js";

export const home = (req, res) =>
  res.json({
    message: "Welcome to my project!",
    status: "In progress",
    user: req.userId,
  });

export const healthCheck = async (req, res) => {
  const health = await prisma.$queryRaw`SELECT NOW()`;

  res.send(health);
};
