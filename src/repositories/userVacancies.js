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
  const query = {
    text: `
    insert into user_vacancies 
    (user_id, vacancy_id, status, note, is_viewed, status_changed_at) values
    ($1, $2, $3, nullif($4, ''), coalesce($5, false), case when $3::application_status is null then null else now() end)
    on conflict (user_id, vacancy_id) do update set
    status = coalesce(excluded.status, user_vacancies.status),
    note = nullif(coalesce($4, user_vacancies.note), ''),
    is_viewed = coalesce($5, user_vacancies.is_viewed),
    status_changed_at = coalesce(excluded.status_changed_at, user_vacancies.status_changed_at)
    returning user_id as "userId", vacancy_id as "vacancyId", status, note, is_viewed as "isViewed", status_changed_at as "statusChangedAt";
    `,
    values: [userId, vacancyId, status, note, isViewed],
  };

  return (await pool.query(query)).rows[0];
}
