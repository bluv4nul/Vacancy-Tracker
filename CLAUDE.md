# Vacancy Tracker — контекст проекта

Файл лежит в репозитории и общий для всех машин (ПК и ноутбук). Долговременные договорённости и текущее состояние записывать сюда, а не в локальную память Claude — она остаётся на одном компьютере.

## О проекте
Веб-приложение для поиска стажировок и вакансий разработчика и учёта откликов. Пет-проект для портфолио (backend на Node.js). Автор — Андрей (bluv4nul).
Репозиторий: https://github.com/bluv4nul/Vacancy-Tracker
Подробное описание проблемы, функций MVP и границ — docs/design.md. Схема БД — docs/schema.dbml.

## Стек
- JavaScript (не TypeScript; переход на TS — после MVP), ES-модули (`"type": "module"`)
- Node.js + Express
- PostgreSQL. Шаги 1–3 — драйвер `pg` и сырой SQL; с шага 4 (решено 2026-10-28) переход на Prisma ORM 7, сложные запросы (лента) можно оставить на сыром SQL через Prisma.
- Лицензия MIT, в package.json `"private": true`

## Архитектурные решения
- **Источники вакансий — модули с единым интерфейсом.** В MVP два источника: hh.ru (официальное API) и ручное добавление. Хабр Карьера — позже (API неофициальное: вакансии лежат JSON-ом в `<script type="application/json">` на странице; учитывать правила сайта и делать редкие запросы). Парсинг сайтов компаний и каналов в MVP не входит.
- **Поиск словами** (чипы, режим И/ИЛИ на весь поиск, слова-исключения) собирается в язык запросов hh (AND/OR/NOT).
- **Слой repository:** весь доступ к БД изолирован в отдельном слое, остальной код не знает, SQL там или ORM. Шаги 1–3 написаны на `pg` + сыром SQL (цель — понимать SQL; достигнута: JOIN/LEFT JOIN, ON CONFLICT, COALESCE/NULLIF/CASE, NULL, ENUM, приведение типов). Перевод на Prisma перенесён с «после MVP» на шаг 4: CRUD на сыром SQL стал муторным, а repository-слой позволяет сменить доступ к БД, не трогая обработчики.
- **Пользователь** пока один, но схема рассчитана на многих. Вход обязателен: проект будет в интернете. Пароли хранятся только как хеш.
- **Уведомления** в MVP только через Telegram: у пользователя поле `telegram_chat_id`, отдельной таблицы каналов нет (YAGNI).

## Схема БД (итог в docs/schema.dbml)
7 таблиц: users, companies, vacancies, user_vacancies, saved_searches, search_results, hidden_companies; ENUM: source_type, application_status, search_mode.
- Связующие таблицы (user_vacancies, search_results, hidden_companies) — с составным первичным ключом, без отдельного id.
- Статус и признак «просмотрено» хранятся в user_vacancies, а не в вакансии.
- `(source, external_id)` уникальна. У ручных вакансий external_id = NULL, и они не конфликтуют, потому что NULL ≠ NULL.
- ENUM — для наборов, которыми управляем мы (статусы, источник, режим поиска). Данные внешних систем (опыт из справочника hh) — varchar.
- include_words / exclude_words — массивы `text[]` в saved_searches: слова всегда используются целиком для строки запроса к hh.
- Ручные вакансии личные (`owner_id`), у вакансий hh owner_id = NULL.
- Одна заметка на вакансию (поле `note`). Полное описание вакансии подгружается при открытии и сохраняется.
- Даты — `timestamptz`, `external_id` — varchar, `telegram_chat_id` — bigint.
- Статусы: interested → applied → test_task → interview → offer / rejected / withdrawn, плюс skipped.

## Git
- Каждая задача — отдельная ветка и PR, даже в одиночку. Андрей присылает ссылку на PR, Claude делает ревью, мерж — Squash and merge.
- Мелкие правки служебных файлов (.gitignore, переименования, опечатки в документации) Андрей коммитит прямо в `main` — это не нарушение правила выше.
- Коммиты — Conventional Commits на английском, повелительное наклонение (`docs: add ...`). Документация на русском.

## Правила работы (главное)
- **Код пишет Андрей сам.** Claude не пишет и не правит код в проекте, даже на просьбу «просто сделай» — в этом случае напомнить об этом правиле. Документацию и служебные файлы (README, `CLAUDE.md`) Claude может править по просьбе Андрея.
- **Роль Claude — сеньор в команде:** помогает проектировать, задаёт наводящие вопросы, делает ревью, указывает на первоисточники (документация Node, Express, PostgreSQL, hh API и т. д.). На вопросы по коду отвечает концепцией и ссылкой, а не готовым кодом. По умолчанию без примеров кода; если Андрей сам попросит — короткий абстрактный пример не из проекта.
- **Ревью:** замечания с метками 🔴 блокер / 🟡 стоит поправить / ⚪ мелочь — что не так, почему это проблема, куда смотреть. Готовое исправление не давать. Если Андрей строит что-то, что потом придётся выкинуть целиком, сказать сразу.
- **Работаем по шагам:** не выдавать решение целиком. После каждого шага Андрей может уточнить или что-то поменять. В одном ответе — один шаг или одна тема; если замечаний несколько, сначала главное, остальные по очереди.
- **Когда Андрей застрял,** сначала ищет и пробует сам, а приходит с тем, что уже пробовал.
- **Доступ:** можно свободно читать файлы, смотреть git log/diff и запускать команды только для чтения и диагностики (логи, статус контейнеров, тесты). Ничего не изменять (файлы, git, контейнеры, БД) без явной просьбы Андрея.
- Общение — по-русски. Объяснения подробные и понятные, а не сжатые. Наводящие вопросы нужны — Андрей любит искать и выбирать сам, — но не больше одного за ответ; мелкие детали и подвохи объяснять самому. Ссылки на документацию давать всегда, как справку.

## Текущее состояние (обновлено 2026-10-29)

### Что уже сделано
- Спроектированы функции MVP и схема БД: docs/design.md, docs/schema.dbml, docs/image/dbdiagram.png.
- Репозиторий: package.json, .gitignore (шаблон Node + .env; `CLAUDE.local.md` игнорируется — для заметок одной машины), LICENSE, README.md.
- PR #1 «chore: fix package.json and add README» — слит.
- PR #2 «chore: adds compose file, and postgresql docker image» — слит. PostgreSQL локально в Docker:
  - compose.yaml: сервис `db`, образ `postgres:18` (Debian, плавающий минор), `env_file: .env`, именованный том `pg-data` на `/var/lib/postgresql`, порт `127.0.0.1:5432:5432`.
  - .env (не в git) и .env.example: POSTGRES_PASSWORD, POSTGRES_USER, POSTGRES_DB; пользователь и база — `vacancytracker`.
- PR #3 «chore: create 001_init.sql with first migration, update readme» — слит. Первая миграция:
  - Способ миграций: нумерованные .sql-файлы в `migrations/`, применяются вручную через psql (`Get-Content .\migrations\001_init.sql | docker compose exec -T db psql -U vacancytracker -d vacancytracker`). Учёта применённых миграций нет — вернуться к этому перед деплоем.
  - `migrations/001_init.sql`: 3 ENUM и все 7 таблиц; применена на чистую локальную базу и проверена.
  - Отличия от первоначальной схемы: строки — `text` вместо `varchar` (кроме `currency varchar(3)`); id — `generated always as identity`; все внешние ключи `on delete cascade`, кроме `vacancies.company_id` (запрет). schema.dbml приведён в соответствие.
  - В README раздел «Запуск»: поднять базу, применить миграцию (PowerShell и bash), войти в psql.
- Мини-задание про NULL выполнено.
- PR #4 «chore: add small backend and database connection, update start in readme» — слит. Каркас приложения:
  - `src/app.js` — точка входа, Express 5, порт `process.env.PORT || 3000`; маршруты `GET /` и `GET /health` (`SELECT now()`, отдаёт `result.rows`).
  - `src/db.js` — экспорт пула `pg.Pool` без параметров: подключение берётся из переменных PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE.
  - `src/handlers.js` — обработчики `home` и `healthCheck`.
  - `.env` читается встроенным флагом Node (`node --env-file=.env src/app.js` в скрипте `start`). В `.env`/`.env.example` две группы переменных: POSTGRES_* для контейнера и PG* для приложения (пароль в двух местах).
  - README «Запуск»: Docker и Node.js 20.6+, миграция, `npm install`, `npm start`, проверка `/health`.
- PR #5 «chore: add middleware and .sql script to define user» — слит. Тестовый пользователь:
  - `seeds/001_dev_user.sql`: пользователь `test@test.test`, `password_hash = login-disabled` (заглушка, войти нельзя), получает `id = 1`. Seed-файлы лежат отдельно от миграций, применяются так же через psql.
  - `src/middleware.js`: `defineUser` ставит `req.userId = 1` для всех маршрутов (`app.use`). Заглушка до настоящего входа — заменить только эту функцию.
  - README «Запуск»: шаг применения seed после миграции.
- PR #6 «feat: add manual vacancies API» — слит. Ручные вакансии:
  - API: `GET /vacancies` — ручные вакансии текущего пользователя, новые первыми; `POST /vacancies` — тело `{ companyName, title, url, ...необязательные }`, обязательны `companyName`, `title`, `url` (иначе 400 `{ error }`), успех — 201 с созданной вакансией. Имена полей в API — camelCase. README: раздел «API» с примером тела.
  - `src/repositories/companies.js`: `findOrCreateManualCompany(name)` (поиск `lower(name) = lower(trim(...))` среди `source = manual`, иначе `INSERT ... trim(...) RETURNING`). `findManualCompanyByName` — внутренняя, без export.
  - `src/repositories/vacancies.js`: `listManualVacanciesByOwner(userId)` и `createManualVacancy(userId, companyId, { title, url, city, salaryFrom, salaryTo, currency, experience, schedule, description, publishedAt })`. Колонки возвращаются с псевдонимами в camelCase (`salary_from as "salaryFrom"`); `source`/`external_id` при вставке — константы в SQL; `first_seen_at` ставит база.
  - `src/handlers/`: `system.js` (`home`, `healthCheck`, перенесён из `src/handlers.js`) и `vacancies.js` (`listVacancies`, `createVacancy`). Обработчики не знают про SQL, вызывают repository.
  - `src/app.js`: `app.use(setCurrentUser)` (middleware переименована из `defineUser`), `app.use(express.json())`, маршруты `/vacancies`.
  - Соглашение об именах: repository — по действию с данными (`list…`, `create…`, `findOrCreate…`), обработчики — по действию API (`listVacancies`, `createVacancy`).
- PR #7 «feat: add vacancy statuses and notes» — слит (2026-10-28). Подробности решений — ниже, в бывшем разделе шага 3.

### Шаг 3 (готов, PR #7) — решения, которые важны дальше
Проверено вручную (16 сценариев HTTP-клиентом + список с двумя вакансиями):
- API `PATCH /vacancies/:id`, тело `{ status?, note?, isViewed? }`. Решения:
  - PATCH (частичное изменение), `id` в пути; пользователь только из `req.userId`, никогда из тела.
  - `null` = «поле не прислали» (вариант B) для всех полей; хотя бы одно значимое поле, иначе 400. Проверки «пришло» — через `!= null` (ловит и null, и undefined).
  - Заметку очищают пустой строкой `""`; в базе хранится NULL.
  - 400 — неверное тело (`status` не из ENUM, `note` не строка, `isViewed` не boolean); 404 — `id` не целое положительное, вакансии нет или она чужая (одинаково, не раскрывать чужую).
- `src/repositories/userVacancies.js`: `listStatuses()` — `enum_range(null::application_status)::text[]` (приведение к `text[]`, иначе `pg` отдаёт строку), кэш в переменной модуля при первом обращении (неудача не кэшируется). `insertOrUpdateUserVacancy(userId, vacancyId, { status, note, isViewed })` — `INSERT … ON CONFLICT (user_id, vacancy_id) DO UPDATE`: `coalesce(новое, старое)`; для `note` и `is_viewed` в `DO UPDATE` берутся параметры `$4`/`$5`, а не `excluded` (там уже обработанные `nullif`/`coalesce(…, false)`); `status_changed_at` = `now()` только если пришёл статус (`$3::application_status is null` — явный тип, иначе `could not determine data type of parameter $3`). `RETURNING` с camelCase.
- `findManualVacancy(vacancyId, ownerId)` в `repositories/vacancies.js` — `select id … where id = $1 and owner_id = $2`, `rows[0] ?? null`. Порядок аргументов не как у остальных (пользователь не первый) — Андрей решил оставить.
- Обработчик `updateVacancy` в `handlers/vacancies.js`, маршрут `app.patch("/vacancies/:id", …)`. Тексты ошибок поправлены («is required», «Invalid fields.»).
- `listManualVacanciesByOwner`: `from vacancies as v left join user_vacancies as uv on uv.user_id = $1 and v.id = uv.vacancy_id where owner_id = $1`; в ответе добавлены `status`, `note`, `coalesce(is_viewed, false) as "isViewed"`, `statusChangedAt`. Разобрано: условие на пользователя — в `ON`, не в `WHERE` (иначе LEFT JOIN становится INNER и нетронутые вакансии пропадают). ⚪ колонки без префиксов `v.`/`uv.`, список одной длинной строкой — на усмотрение Андрея.
- README: строка `PATCH` в таблице, подразделы `GET /vacancies` (новые поля) и `PATCH /vacancies/:id` (поля, `null`/`""`, ответы 200/400/404).

- На будущее (шаг 6, hh): проверку доступа расширить — «моя ручная или из hh» (у hh `owner_id = NULL`). В ленте hh условие на пользователя в `ON` обязательно сравнивать с текущим пользователем, а не с `owner_id`.
- 2026-10-18 локальный том `pg-data` был пересоздан (данные пропали), миграция и seed применены заново.
- ⚪ Повторная отправка того же статуса обновляет `statusChangedAt` — для MVP приемлемо.

### Где остановились
Идёт шаг 4 — переход на Prisma (обновлено 2026-10-29). Ветка `refactor/prisma`, запушены коммиты: `chore: set up prisma and baseline existing schema`, `refactor: replace pg pool with prisma client module`, `fix: delete old migration folder`. **Приложение сейчас не запускается** (`userVacancies.js` и `handlers/system.js` ещё импортируют `pool` из удалённого `src/db.js`).

Сделано:
- Prisma 7.10.1 (`prisma` — dev, `@prisma/client`, `@prisma/adapter-pg`; `dotenv` — dev, только для CLI). Метка `latest` у CLI `prisma` в npm указывает на `8.0.0-rc` — ставить явно `prisma@7.x`, версия CLI = версии клиента.
- Конфиг CLI — `prisma7.config.ts` (имя создал `prisma init`, CLI его находит сам), `import "dotenv/config"`, URL из `DATABASE_URL`. В `.env.example` переменные `PG*` убраны, оставлены `POSTGRES_*` и `DATABASE_URL`.
- `prisma/schema.prisma`: модели `Company`, `HiddenCompany`, `SavedSearch`, `SearchResult`, `UserVacancy`, `User`, `Vacancy` (PascalCase, ед. число, `@@map`), поля camelCase с `@map`; связи по смыслу (`Vacancy.company`, `Vacancy.owner`, `UserVacancy.user/vacancy`, `SearchResult.search/vacancy`, связи «много» — во мн. числе); enum `ApplicationStatus`, `SearchMode`, `SourceType` с `@@map`, **значения enum как в базе** (`test_task`, `all_words`) — это данные API. `migrate diff --from-config-datasource --to-schema` пустой.
- Baseline: `prisma/migrations/0_init/migration.sql` = побайтная копия старого `001_init.sql` (сгенерированный Prisma терял `identity` и `not null` у `text[]`), отмечен `migrate resolve --applied`; `migrate status` — up to date. Старая папка `migrations/` удалена.
- `prisma generate` → `src/generated/prisma` (в `.gitignore`), файлы `.ts` с импортами `.ts`; Node 26 запускает их сам (type stripping) — проверено, запрос через адаптер работает.
- `src/prisma.js` — единственный экземпляр `PrismaClient` с `PrismaPg({ connectionString: process.env.DATABASE_URL })`, без `dotenv` (приложение читает `.env` через `--env-file`).
- ИИ-скиллы, установленные `prisma init` (`.agents/`, `.claude/skills/`, `.windsurf/`, `skills-lock.json`), — в `.gitignore`.
- `repositories/companies.js` переведён и проверен (`findFirst` с `equals` + `mode: "insensitive"`, `trim()` один раз в начале `findOrCreateManualCompany`, `create`).
- Все три repository закоммичены и запушены одним WIP-коммитом (2026-10-29); `test.js` не в git.
- `repositories/userVacancies.js`: `listStatuses` переведён — `const`-массив `Object.values(ApplicationStatus)` на уровне модуля, без запроса к базе. ⚠ Импорт из `../generated/prisma/enums.js` — **файла `.js` нет, нужно `.ts`** (или импорт из `client.ts`); `let` → `const`. Не проверено. `insertOrUpdateUserVacancy` — ещё старый SQL с `pool`.
- `repositories/vacancies.js` переведён: `listManualVacanciesByOwner` — `findMany` + `include: { userVacancies: { where: { userId } } }` + `map` с распаковкой в плоские `status/note/statusChangedAt` (`?.` и `?? null`) и `isViewed` (`?? false`) — проверено, ответ как у старого SQL. `createManualVacancy` (`create`) и `findManualVacancy` (`findFirst`, без `select`) — написаны, **не проверены**.

Следующее при возвращении:
0. Поправить импорт `ApplicationStatus` на `.ts`, проверить `listStatuses()` → 8 строк.
1. Проверить в `test.js` `createManualVacancy` (в т. ч. `publishedAt` как `"2026-10-15T10:00:00Z"` и как `"2026-10-15"`) и `findManualVacancy` (своя → объект, `999` → null, чужой `ownerId` → null).
2. `userVacancies.js`: `listStatuses` → значения сгенерированного enum `ApplicationStatus` (без запроса к базе, кэш не нужен); `insertOrUpdateUserVacancy` → `prisma.userVacancy.upsert` с ключом `userId_vacancyId`; перенести правило B (`null`/`undefined` = не менять — в Prisma `undefined` = не трогать, `null` = записать NULL, поэтому null из обработчика превращать в undefined), очистку `""` → NULL, `statusChangedAt = new Date()` только если пришёл статус, `isViewed` по умолчанию `false` только при создании; `select`/форма ответа как раньше (`userId, vacancyId, status, note, isViewed, statusChangedAt`).
3. `handlers/system.js` `healthCheck` → `prisma.$queryRaw` для `select now()`.
4. Прогнать 16 сценариев `PATCH` + `GET`/`POST /vacancies` + `/health`.
5. README «Запуск»: `npx prisma migrate deploy` вместо psql, `npx prisma generate` после `npm install`, `DATABASE_URL` вместо `PG*` (пароль в `POSTGRES_PASSWORD` и в `DATABASE_URL`); seed пока через psql. **Срочно: README ссылается на удалённый `migrations/001_init.sql`.**
6. Удалить `test.js`, PR `refactor: …`.

Заметки по Prisma, важные дальше:
- Prisma строже к типам, чем SQL через `pg`: строку `"80000"` в `Int` и, вероятно, дату без времени в `DateTime` не примет → сейчас 500. Закроется проверкой типов в `POST /vacancies` (отложенная задача).
- ⚠ `undefined` в `where` = «не фильтровать». Если `ownerId`/`userId` придёт `undefined`, `findManualVacancy` найдёт чужую вакансию, а `listManualVacanciesByOwner` вернёт вакансии всех. Сейчас безопасно (middleware всегда ставит `req.userId`); на шаге 10 (настоящий вход) middleware обязана не пускать запрос без пользователя дальше.

План шага 4 (выдавать по одному пункту):
1. Решение: кто управляет схемой — Prisma Migrate (baseline текущей базы: `db pull` → `migrate diff --from-empty` в `prisma/migrations/0_init` → `migrate resolve --applied 0_init`; плюс — появится учёт применённых миграций) или свои `.sql` + `db pull` после каждой. **Решено (2026-10-28): вариант A — Prisma Migrate**, baseline текущей базы. `migrations/001_init.sql` станет историей; новые изменения схемы — через `schema.prisma` + `prisma migrate dev`.
2. Установка по гайду «Add to existing project / PostgreSQL» (v7): `prisma` (dev), `@prisma/client`, `@prisma/adapter-pg`; `prisma.config.ts` с URL базы (переменная `DATABASE_URL` в `.env`/`.env.example`). ⚠ Генератор `prisma-client` (по умолчанию в v7) выдаёт TypeScript-файлы в `output`; проект на JS — проверить, что Node 26 запускает их сам (type stripping, `importFileExtension`), это первое, что проверить после генерации.
3. `prisma db pull` → привести схему к соглашениям: модели в единственном числе PascalCase с `@@map`, поля camelCase с `@map` (заменит ручные SQL-псевдонимы), enum-ы.
4. Baseline (если выбран Prisma Migrate).
5. `src/db.js` → модуль с экземпляром PrismaClient и адаптером `PrismaPg`.
6. Перевести repository по одному (`companies`, `vacancies`, `userVacancies`), сигнатуры функций не менять, обработчики не трогать. Особенности: в upsert Prisma `undefined` = «не менять», `null` = «записать NULL» (правило B и очистку `""` перенести явно); `status_changed_at` только при пришедшем статусе; `listStatuses` можно заменить на сгенерированный enum без запроса к базе.
7. Проверка: все 16 сценариев `PATCH` + `GET`/`POST /vacancies`.
8. README «Запуск»: миграции и seed через Prisma (или как решим), `DATABASE_URL`. Убрать `pg`-специфичное; `pg` останется зависимостью адаптера.
9. PR (`refactor: …`).

### Ближайшие шаги по порядку
Решено: сначала API на JSON (проверять HTTP-клиентом), фронтенд выбрать позже.
Порядок функций MVP:
1. ~~Тестовый пользователь + заглушка текущего пользователя~~ — готово (PR #5).
2. ~~Ручное добавление вакансии и список своих вакансий~~ — готово (PR #6).
3. ~~Статусы и заметки (user_vacancies)~~ — готово (PR #7).
4. Переход repository на Prisma (план — в «Где остановились»).
5. Сохранённые поиски (saved_searches) — уже на Prisma. Набросок: CRUD, `include_words`/`exclude_words` — массивы строк, `mode` по ENUM `search_mode`, `DELETE` → 204, `PATCH` с правилом «null = не менять», `last_checked_at` клиент не задаёт. Вопрос Андрею (какие маршруты нужны) был задан до решения про Prisma — вернуться к нему.
6. Источник hh, запуск вручную (vacancies, companies, search_results).
7. Лента новых вакансий + скрытие компаний (сложный запрос — кандидат на сырой SQL).
8. Фоновая проверка по расписанию.
9. Уведомления в Telegram.
10. Настоящий вход (до деплоя): bcrypt/argon2, сессии/токены. Middleware не должна пропускать запрос без пользователя: в Prisma `undefined` в `where` снимает фильтр.
Попутно: обработка ошибок в маршрутах — сейчас Express 5 сам отдаёт 500 со стеком; в том числе `POST`/`PATCH /vacancies` без `Content-Type: application/json` (`req.body` = undefined) и неверные типы полей в `POST` дают 500 вместо 400; `PATCH /vacancies/99999999999` — 500 (`int` out of range). Убрать `user: req.userId` из ответа `/`. Название компании в ответах о вакансиях (сейчас только `companyId`) — отдельной задачей после шага 3: обычный `JOIN companies` (`company_id not null`), и в `GET /vacancies`, и в ответе `POST /vacancies`, чтобы формат вакансии совпадал; формат (`companyName` или `company: { id, name }`) решить, когда будет ясно с фронтендом. Папку `src/middleware/` завести, когда появится второй middleware (обработчик ошибок).

### Отложенные вопросы по схеме
- `companies`: дубли ручных компаний предотвращаются в приложении (`findOrCreateManualCompany`), защиты на уровне БД нет (частичный уникальный индекс по `lower(name)` где `source = manual` — при необходимости, не для одного пользователя). «Яндекс»/«Yandex» не склеиваются.

### После MVP
- Перейти на TypeScript; Хабр Карьера вторым источником.
- Деплой (на свой домен), тесты, полная инструкция в README.
- Вне репозитория: отклики на стажировки.

### Открытые вопросы
- Фронтенд: шаблоны из Express или отдельное SPA.
- Авторизация: bcrypt или argon2, сессии или токены.
- Деплой: где и как работает фоновая проверка поисков; как часто и чем запускать; лимиты API hh.
- API hh: отдаёт ли поиск полное описание или фрагмент; город — это area с числовым id.

### Окружение
- Работа идёт на двух машинах (ПК и ноутбук), синхронизация через GitHub. Перед сменой машины — закоммитить и запушить рабочую ветку. На новой машине: клонировать, `.env` по образцу `.env.example`, `docker compose up -d`, `npm install`, `npx prisma generate`, `npx prisma migrate deploy`, seed через psql (`seeds/001_dev_user.sql`). README «Запуск» пока устарел (ссылается на удалённый `migrations/001_init.sql`).
- В Docker также живёт чужой для этого проекта compose-проект `wikialien` (Wiki.js + postgres:17-alpine, порт 8080) — не трогать.
- `gh` CLI не установлен: PR смотреть через `git ls-remote` / локальный diff и публичный GitHub API.
