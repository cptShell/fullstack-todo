# Fullstack (backend)

Кратко: как поднять бэкенд и Postgres после `git clone`.

## Что нужно

- **Node.js 20+** (Prisma 7 и текущий тулчейн на нём нормально живут)
- **PostgreSQL** локально или в Docker

## 1. Postgres

Нужна **логическая база** с именем, которое попадёт в `DATABASE_URL` (в примере ниже — `todos`).

**Вариант A — Docker** (поднимает сервер и сразу создаёт БД `todos`):

```bash
docker run -d --name fullstack-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=todos \
  -p 5432:5432 \
  postgres:16
```

**Вариант B — свой Postgres:** создай базу, например:

```bash
createdb todos
# или через psql: CREATE DATABASE todos;
```

Пользователь/пароль/порт должны совпадать с тем, что ты укажешь в `DATABASE_URL`.

## 2. Переменные окружения

```bash
cd backend
cp .env_example .env
```

Отредактируй `.env`: строка `DATABASE_URL` должна указывать на **твою** базу (хост, порт, пользователь, пароль, имя БД).

## 3. Зависимости и Prisma

Клиент Prisma генерится в `backend/generated/prisma` (в git не коммитится), миграции лежат в `backend/prisma/migrations`.

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

`migrate deploy` применит SQL из папки миграций к базе из `DATABASE_URL`. Если база пустая и URL верный — появятся таблицы (в т.ч. `Todo`).

Проверка связи (опционально):

```bash
npx prisma migrate status
```

## 4. Запуск API

```bash
npm run dev
```

Сервер слушает **http://localhost:3000** (см. `app.ts`).

Проверка: `GET http://localhost:3000/todos` — должен вернуться JSON (пустой массив `[]`, если записей ещё нет).

---

**Если что-то не коннектится:** сравни хост/порт/имя БД в `.env` с тем, куда реально смотрит Postgres; смотри текст ошибки (нет сервера / нет базы `database "…" does not exist` / нет таблиц после забытого `migrate deploy`).
