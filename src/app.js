import express from "express";

import { home, healthCheck } from "./handlers/system.js";

import {
  listVacancies,
  createVacancy,
  updateVacancy,
} from "./handlers/vacancies.js";

import {
  listSearches,
  createSearch,
  deleteSearch,
  updateSearch,
} from "./handlers/searches.js";

import { setCurrentUser } from "./middleware.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(setCurrentUser);
app.use(express.json());

app.get("/", home);

app.get("/vacancies", listVacancies);
app.post("/vacancies", createVacancy);
app.patch("/vacancies/:id", updateVacancy);

app.get("/searches", listSearches);
app.post("/searches", createSearch);
app.delete("/searches/:id", deleteSearch);
app.patch("/searches/:id", updateSearch);

app.get("/health", healthCheck);

app.listen(PORT, () => {
  console.log(`Server is on http://localhost:${PORT}`);
});
