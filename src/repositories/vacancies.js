import { prisma } from "../prisma.js";

export async function listManualVacanciesByOwner(userId) {
  const vacancies = await prisma.vacancy.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: { firstSeenAt: "desc" },
    include: {
      userVacancies: {
        where: {
          userId: userId,
        },
      },
    },
  });

  const flat = vacancies.map((vacancy) => {
    const { userVacancies, ...vacancyFields } = vacancy;
    const userVacancy = userVacancies[0];

    return {
      ...vacancyFields,
      status: userVacancy?.status ?? null,
      note: userVacancy?.note ?? null,
      statusChangedAt: userVacancy?.statusChangedAt ?? null,
      isViewed: userVacancy?.isViewed ?? false,
    };
  });

  return flat;
}

export async function createManualVacancy(
  userId,
  companyId,
  {
    title,
    url,
    city,
    salaryFrom,
    salaryTo,
    currency,
    experience,
    schedule,
    description,
    publishedAt,
  },
) {
  const vacancy = await prisma.vacancy.create({
    data: {
      source: "manual",
      externalId: null,
      ownerId: userId,
      companyId: companyId,
      title: title,
      url: url,
      city: city,
      salaryFrom: salaryFrom,
      salaryTo: salaryTo,
      currency: currency,
      experience: experience,
      schedule: schedule,
      description: description,
      publishedAt: publishedAt,
    },
  });

  return vacancy;
}

export async function findManualVacancy(vacancyId, ownerId) {
  const vacancy = await prisma.vacancy.findFirst({
    where: {
      AND: [{ id: vacancyId }, { ownerId: ownerId }],
    },
  });

  return vacancy;
}
