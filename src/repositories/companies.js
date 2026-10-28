import { pool } from "../prisma.js";

async function findManualCompanyByName(name) {
  const query = {
    text: `select id, source, external_id as "externalId", name from companies 
    where source = 'manual' and lower(name) = lower(trim($1));`,
    values: [name],
  };

  return (await pool.query(query)).rows[0] ?? null;
}

export async function findOrCreateManualCompany(name) {
  const existing = await findManualCompanyByName(name);
  if (existing) {
    return existing;
  }

  const query = {
    text: `insert into companies (source, name) values 
    ('manual', trim($1)) 
    returning id, source, external_id as "externalId", name`,
    values: [name],
  };

  return (await pool.query(query)).rows[0];
}
