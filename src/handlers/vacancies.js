import {
  listManualVacanciesByOwner,
  createManualVacancy,
} from "../repositories/vacancies.js";
import { findOrCreateManualCompany } from "../repositories/companies.js";

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
