import { pool } from "../db.js";

export async function listManualVacanciesByOwner(userId) {
  const query = {
    text: `
        select
        id, source, external_id as "externalId", owner_id as "ownerId", company_id as "companyId", title, url, city, salary_from as "salaryFrom", salary_to as "salaryTo", currency, experience, schedule, description, published_at as "publishedAt", first_seen_at as "firstSeenAt", status, note, coalesce(is_viewed, false) as "isViewed", status_changed_at as "statusChangedAt" 
        from vacancies as v
        left join user_vacancies as uv on uv.user_id = $1 and v.id = uv.vacancy_id
        where owner_id = $1
        order by "firstSeenAt" desc`,
    values: [userId],
  };

  return (await pool.query(query)).rows;
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
  const query = {
    text: `
        insert into vacancies (source, external_id, owner_id, company_id, title, url, city, salary_from, salary_to, currency, experience, schedule, description, published_at)
        values
        ('manual', null, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        returning id, source, external_id as "externalId", owner_id as "ownerId", company_id as "companyId", title, url, city, salary_from as "salaryFrom", salary_to as "salaryTo", currency, experience, schedule, description, published_at as "publishedAt", first_seen_at as "firstSeenAt"
         `,
    values: [
      userId,
      companyId,
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
    ],
  };

  return (await pool.query(query)).rows[0];
}

export async function findManualVacancy(vacancyId, ownerId) {
  const query = {
    text: `select id from vacancies where
    id = $1 and owner_id = $2`,
    values: [vacancyId, ownerId],
  };

  return (await pool.query(query)).rows[0] ?? null;
}
