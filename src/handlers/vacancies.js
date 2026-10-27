import {
  listManualVacanciesByOwner,
  createManualVacancy,
  findManualVacancy,
} from "../repositories/vacancies.js";
import { findOrCreateManualCompany } from "../repositories/companies.js";
import {
  insertOrUpdateUserVacancy,
  listStatuses,
} from "../repositories/userVacancies.js";

export const listVacancies = async (req, res) => {
  const vacancies = await listManualVacanciesByOwner(req.userId);
  res.json(vacancies);
};

export const createVacancy = async (req, res) => {
  const { companyName, ...vacancyFields } = req.body;
  if (!vacancyFields.title || !vacancyFields.url || !companyName) {
    res.status(400).json({
      error: "Fields: companyName, title and url are required. Try again.",
    });
    return;
  }
  const company = await findOrCreateManualCompany(companyName);
  const vacancy = await createManualVacancy(
    req.userId,
    company.id,
    vacancyFields,
  );
  res.status(201).json(vacancy);
};

export const updateVacancy = async (req, res) => {
  const vacancyId = Number(req.params.id);

  if (vacancyId % 1 != 0 || !(vacancyId > 0)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const userId = req.userId;
  const { status, note, isViewed } = req.body;

  if (status == null && note == null && isViewed == null) {
    res
      .status(400)
      .json({ error: "At least one field is required (status/note/isViewed)" });
    return;
  }

  const statuses = await listStatuses();
  if (
    (status != null && !statuses.includes(status)) ||
    (note != null && typeof note != "string") ||
    (isViewed != null && typeof isViewed != "boolean")
  ) {
    res.status(400).json({ error: "Invalid fields." });
    return;
  }

  if (!(await findManualVacancy(vacancyId, userId))) {
    res.status(404).json({ error: "No vacancy." });
    return;
  }

  res.json(
    await insertOrUpdateUserVacancy(userId, vacancyId, {
      status,
      note,
      isViewed,
    }),
  );
};
