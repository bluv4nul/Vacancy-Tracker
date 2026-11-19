import { prisma } from "../prisma.js";
import {
  listModes,
  createSavedSearch,
  listUserSearches,
  deleteSavedSearch,
  updateSavedSearch,
} from "../repositories/searches.js";

function validateSearchFields(searchFields) {
  if (searchFields.name !== undefined) {
    if (
      typeof searchFields.name != "string" ||
      searchFields.name.trim().length == 0
    ) {
      return "Name must be string, not empty!";
    }
  }

  if (searchFields.excludeWords !== undefined) {
    if (!Array.isArray(searchFields.excludeWords)) {
      return "Exclude words must be an array!";
    }
    if (!searchFields.excludeWords.every((elem) => typeof elem == "string")) {
      return "Include and exclude words must be all string!";
    }
  }

  if (searchFields.includeWords !== undefined) {
    if (!Array.isArray(searchFields.includeWords)) {
      return "Include words must be an array!";
    }

    if (!searchFields.includeWords.every((elem) => typeof elem == "string")) {
      return "Include and exclude words must be all string!";
    }
  }

  if (searchFields.mode !== undefined) {
    const modes = listModes();
    if (!modes.includes(searchFields.mode)) {
      return "Search mode should be all_words or any_word!";
    }
  }

  if (searchFields.isActive !== undefined) {
    if (typeof searchFields.isActive != "boolean") {
      return "isActive must be boolean!";
    }
  }

  if (searchFields.city != undefined || searchFields.experience != undefined) {
    if (
      (typeof searchFields.city != "string" && searchFields.city != null) ||
      (typeof searchFields.experience != "string" &&
        searchFields.experience != null)
    ) {
      return "City and experience must be string or null. ";
    }

    return false;
  }
}

function nullToUndefined(searchFields) {
  Object.keys(searchFields).forEach((key) => {
    if (searchFields[key] === null) {
      searchFields[key] = undefined;
    }
  });
}

export const listSearches = async (req, res) => {
  const userSearches = await listUserSearches(req.userId);

  res.status(200).json(userSearches);
};

export const createSearch = async (req, res) => {
  if (req.body == undefined) {
    res.status(400).json({ error: "Body is required!" });
    return;
  }

  const { ...searchFields } = req.body;

  if (searchFields.name === undefined) {
    res.status(400).json({ error: "Name is required field!" });
    return;
  }

  const validationError = validateSearchFields(searchFields);

  if (validationError) {
    res.status(400).json({ error: `${validationError}` });
    return;
  }

  const search = await createSavedSearch(req.userId, searchFields);

  res.status(201).send(search);
};

export const deleteSearch = async (req, res) => {
  const searchId = Number(req.params.id);

  if (!Number.isInteger(searchId) || searchId <= 0 || searchId > 2147483647) {
    res.status(404);
    res.end();
    return;
  }

  const userId = req.userId;

  const deleted = await deleteSavedSearch(searchId, userId);

  if (deleted.count == 0) {
    res.status(404).send("No data");
    return;
  } else if (deleted.count == 1) {
    res.status(204);
    res.end();
    return;
  }
};

export const updateSearch = async (req, res) => {
  if (req.body == undefined) {
    res.status(400).json({ error: "Body is required!" });
    return;
  }

  const searchId = Number(req.params.id);
  const userId = req.userId;

  if (!Number.isInteger(searchId) || searchId <= 0 || searchId > 2147483647) {
    res.status(404);
    res.end();
    return;
  }

  const { ...searchFields } = req.body;

  nullToUndefined(searchFields);

  const validationError = validateSearchFields(searchFields);

  if (validationError) {
    res.status(400).json({ error: `${validationError}` });
    return;
  }

  if (searchFields.city !== undefined) {
    if (searchFields.city.length == 0) {
      searchFields.city = null;
    }
  }
  if (searchFields.experience !== undefined) {
    if (searchFields.experience.length == 0) {
      searchFields.experience = null;
    }
  }

  const updated = await updateSavedSearch(searchId, userId, searchFields);

  if (updated == null) {
    res.status(404).json({ error: "Not found!" });
    return;
  }

  res.status(200).json(updated);
};
