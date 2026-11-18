import { prisma } from "../prisma.js";
import { SearchMode } from "../generated/prisma/enums.ts";

const modes = Object.values(SearchMode);

export function listModes() {
  return modes;
}

export async function listUserSearches(userId) {
  const userSearches = await prisma.savedSearch.findMany({
    where: { userId: userId },
    orderBy: {
      createdAt: "desc",
    },
  });

  return userSearches;
}

export async function createSavedSearch(
  userId,
  { name, mode, includeWords, excludeWords, city, experience, isActive },
) {
  const search = await prisma.savedSearch.create({
    data: {
      userId: userId,
      name: name,
      mode: mode,
      includeWords: includeWords,
      excludeWords: excludeWords,
      city: city,
      experience: experience,
      isActive: isActive,
    },
  });

  return search;
}
