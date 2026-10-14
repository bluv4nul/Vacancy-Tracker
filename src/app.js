import express from "express";

import { home, healthCheck } from "./handlers.js";
import { defineUser } from "./middleware.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(defineUser);

app.get("/", home);

app.get("/health", healthCheck);

app.listen(PORT, () => {
  console.log(`Server is on http://localhost:${PORT}`);
});
