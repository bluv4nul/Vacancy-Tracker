import { prisma } from "../prisma.js";
import { ApplicationStatus } from "../generated/prisma/enums.ts";

const statuses = Object.values(ApplicationStatus);

export async function listStatuses() {
  return statuses;
}

export async function insertOrUpdateUserVacancy(
  userId,
  vacancyId,
  { status, note, isViewed },
) {
  let statusChangedAt = undefined;

  if (status != null) {
    statusChangedAt = new Date();
  } else {
    status = undefined;
  }
  if (note === "") {
    note = null;
  } else if (note == null) {
    note = undefined;
  }
  if (isViewed == null) {
    isViewed = undefined;
  }

  const userVacancy = await prisma.userVacancy.upsert({
    where: { userId_vacancyId: { userId, vacancyId } },
    update: {
      status,
      note,
      isViewed,
      statusChangedAt,
    },
    create: {
      userId,
      vacancyId,
      status,
      note,
      isViewed,
      statusChangedAt,
    },
  });

  return userVacancy;
}
