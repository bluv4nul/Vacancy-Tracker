import {
  listModes,
  createSavedSearch,
  listUserSearches,
} from "../repositories/searches.js";

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
    res.status(400).json({
      error: "Name is required field!",
    });
    return;
  }

  if (
    typeof searchFields.name != "string" ||
    searchFields.name.trim().length == 0
  ) {
    res.status(400).json({
      error: "Name must be string, not empty!",
    });
    return;
  }

  if (searchFields.excludeWords !== undefined) {
    if (!Array.isArray(searchFields.excludeWords)) {
      res.status(400).json({ error: "Exclude words must be an array!" });
      return;
    }
    if (!searchFields.excludeWords.every((elem) => typeof elem == "string")) {
      res.status(400).json({
        error: "Include and exclude words must be all string!",
      });
      return;
    }
  }

  if (searchFields.includeWords !== undefined) {
    if (!Array.isArray(searchFields.includeWords)) {
      res.status(400).json({ error: "Include words must be an array!" });
      return;
    }

    if (!searchFields.includeWords.every((elem) => typeof elem == "string")) {
      res.status(400).json({
        error: "Include and exclude words must be all string!",
      });
      return;
    }
  }

  if (searchFields.mode !== undefined) {
    const modes = listModes();
    if (!modes.includes(searchFields.mode)) {
      res
        .status(400)
        .json({ error: "Search mode should be all_words or any_word!" });
      return;
    }
  }

  if (searchFields.isActive !== undefined) {
    if (typeof searchFields.isActive != "boolean") {
      res.status(400).json({ error: "isActive must be boolean!" });
      return;
    }
  }

  if (searchFields.city != undefined || searchFields.experience != undefined) {
    if (
      (typeof searchFields.city != "string" && searchFields.city != null) ||
      (typeof searchFields.experience != "string" &&
        searchFields.experience != null)
    ) {
      res
        .status(400)
        .json({ error: "City and experience must be string or null. " });
      return;
    }
  }

  const search = await createSavedSearch(req.userId, searchFields);

  res.status(201).send(search);
};
