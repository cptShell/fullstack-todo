import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { TodoPayload, TodoSearchParams, TodoUpdatePayload } from "./types.ts";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.get('/todos', async (req, res) => {
  const completed = req.query.completed;

  const where = completed !== undefined 
    ? { completed: completed === 'true' }
    : {};

  const todos = await prisma.todo.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  res.json(todos);
});

app.get('/todos/:id', async (req, res) => {
  const targetId = req.params.id;

  if (!targetId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const targetTodo = await prisma.todo.findUnique({
    where: { id: targetId }
  });

  if (!targetTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(targetTodo);
});

app.post('/todos', async (
  req: express.Request<unknown, unknown, TodoPayload>,
  res
) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const data = { title: title.trim(), completed: false };

  const newTodo = await prisma.todo.create({ data });

  res.status(201).json(newTodo);
});

app.patch('/todos/:id', async (
  req: express.Request<TodoSearchParams, unknown, TodoUpdatePayload>,
  res
) => {
  const targetId = req.params.id;
  const payload = req.body;

  if (!targetId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const targetTodo = await prisma.todo.findUnique({
    where: { id: targetId }
  });

  if (!targetTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodo = await prisma.todo.update({
    where: { id: targetId },
    data: payload
  });

  res.json(updatedTodo);
});

app.delete('/todos/:id', async (req: express.Request<TodoSearchParams>, res) => {
  const targetId = req.params.id;

  if (!targetId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const targetTodo = await prisma.todo.findUnique({
    where: { id: targetId }
  });

  if (!targetTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const removedTodo = await prisma.todo.delete({
    where: { id: targetId }
  });

  res.json(removedTodo);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
