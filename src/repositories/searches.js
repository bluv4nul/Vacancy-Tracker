import { prisma } from "../prisma.js";
import { SearchMode } from "../generated/prisma/enums.ts";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace.ts";

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

export async function deleteSavedSearch(searchId, userId) {
  const deleted = await prisma.savedSearch.deleteMany({
    where: {
      id: searchId,
      userId: userId,
    },
    limit: 1,
  });

  return deleted;
}

export async function updateSavedSearch(
  searchId,
  userId,
  { name, includeWords, excludeWords, mode, isActive, city, experience },
) {
  try {
    const search = await prisma.savedSearch.update({
      where: { id: searchId, userId: userId },
      data: {
        name,
        includeWords,
        excludeWords,
        mode,
        isActive,
        city,
        experience,
      },
    });
    return search;
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == "P2025"
    ) {
      return null;
    }
    throw error;
  }
}
