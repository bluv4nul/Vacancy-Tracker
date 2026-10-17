import { pool } from "../db.js";

export async function listManualVacanciesByOwner(userId) {
  const query = {
    text: `
        select
        id, source, external_id as "externalId", owner_id as "ownerId", company_id as "companyId", title, url, city, salary_from as "salaryFrom", salary_to as "salaryTo", currency, experience, schedule, description, published_at as "publishedAt", first_seen_at as "firstSeenAt" 
        from vacancies
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
