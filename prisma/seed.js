import { prisma } from "../src/prisma.js";
try {
  const testUser = await prisma.user.upsert({
    where: { email: "test@test.test" },
    update: {},
    create: {
      email: "test@test.test",
      passwordHash: "login-disabled",
    },
  });
} finally {
  await prisma.$disconnect();
}
