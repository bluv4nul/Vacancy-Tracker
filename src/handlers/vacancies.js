import isUrlHttp from "is-url-http";
import validator from "validator";

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

function validateCreateVacancyFields(companyName, vacancyFields) {
  if (companyName !== undefined) {
    if (typeof companyName != "string") {
      return "CompanyName must be string!";
    }
    if (companyName.trim().length <= 0) {
      return "CompanyName must not be empty!";
    }
  }

  if (vacancyFields.title !== undefined) {
    if (typeof vacancyFields.title != "string") {
      return "title must be string!";
    }
    if (vacancyFields.title.trim().length <= 0) {
      return "companyName must not be empty!";
    }
  }

  if (vacancyFields.url !== undefined) {
    if (!isUrlHttp(vacancyFields.url)) {
      return "url must be valid!";
    }
  }

  if (vacancyFields.city !== undefined) {
    if (typeof vacancyFields.city != "string" && vacancyFields.city != null) {
      return "city must be string or null!";
    }
  }

  if (vacancyFields.experience !== undefined) {
    if (
      typeof vacancyFields.experience != "string" &&
      vacancyFields.experience != null
    ) {
      return "experience must be string or null!";
    }
  }

  if (vacancyFields.schedule !== undefined) {
    if (
      typeof vacancyFields.schedule != "string" &&
      vacancyFields.schedule != null
    ) {
      return "schedule must be string or null!";
    }
  }

  if (vacancyFields.description !== undefined) {
    if (
      typeof vacancyFields.description != "string" &&
      vacancyFields.description != null
    ) {
      return "description must be string or null!";
    }
  }

  if (vacancyFields.salaryFrom !== undefined) {
    if (
      (vacancyFields.salaryFrom > 2147483647 || vacancyFields.salaryFrom < 0) &&
      vacancyFields.salaryFrom != null
    ) {
      return "SalaryFrom must be from 0 to 2147483647";
    }
  }

  if (vacancyFields.salaryTo !== undefined) {
    if (
      (vacancyFields.salaryTo > 2147483647 || vacancyFields.salaryTo < 0) &&
      vacancyFields.salaryTo != null
    ) {
      return "salaryTo must be from 0 to 2147483647";
    }
  }

  if (vacancyFields.currency !== undefined) {
    if (
      vacancyFields.currency != null ||
      typeof vacancyFields.currency != "string" ||
      vacancyFields.currency.length != 3
    ) {
      return "currency must be 3-signed string (RUB/EUR/USD)";
    }
  }

  if (vacancyFields.publishedAt != undefined) {
    if (
      typeof vacancyFields.publishedAt != "string" ||
      !validator.isISO8601(vacancyFields.publishedAt, { strict: true })
    ) {
      return "publishedAt must be valid date or null";
    }

    vacancyFields.publishedAt = new Date(vacancyFields.publishedAt);
  }

  return false;
}

export const listVacancies = async (req, res) => {
  const vacancies = await listManualVacanciesByOwner(req.userId);
  res.json(vacancies);
};

export const createVacancy = async (req, res) => {
  if (req.body == undefined || Array.isArray(req.body)) {
    res.status(400).json({ error: "Body is required!" });
    return;
  }

  const { companyName, ...vacancyFields } = req.body;

  if (!vacancyFields.title || !vacancyFields.url || !companyName) {
    res.status(400).json({
      error: "Fields: companyName, title and url are required. Try again.",
    });
    return;
  }

  const validation = validateCreateVacancyFields(companyName, vacancyFields);

  if (validation) {
    res.status(400).json({ error: `${validation}` });
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
  if (req.body == undefined || Array.isArray(req.body)) {
    res.status(400).json({ error: "Body is required!" });
    return;
  }
  const vacancyId = Number(req.params.id);

  if (vacancyId % 1 != 0 || vacancyId <= 0 || vacancyId >= 2147483648) {
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

  const statuses = listStatuses();
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

  res.status(200).json(
    await insertOrUpdateUserVacancy(userId, vacancyId, {
      status,
      note,
      isViewed,
    }),
  );
};
