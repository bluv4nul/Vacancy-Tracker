import { prisma } from "../prisma.js";

async function findManualCompanyByName(inputName) {
  const company = await prisma.company.findFirst({
    where: {
      AND: [
        {
          source: "manual",
        },
        {
          name: {
            equals: inputName,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  return company;
}

export async function findOrCreateManualCompany(inputName) {
  inputName = inputName.trim();

  const existing = await findManualCompanyByName(inputName);
  if (existing) {
    return existing;
  }

  const company = await prisma.company.create({
    data: {
      source: "manual",
      name: inputName,
    },
  });

  return company;
}
