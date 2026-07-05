import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Prisma, PrismaClient } from "./generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

app.get('/health', async (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
  const targetId = req.params.id;
  const user = await prisma.user.findUnique({ where: { id: targetId } });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!isNonEmptyString(email)) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Email must be valid' });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/users/:id', async (req, res) => {
  const targetId = req.params.id;
  const { name, email } = req.body;

  if ("userId" in req.body) {
    return res.status(400).json({ error: "Cannot change userId" });
  }

  const user = await prisma.user.update({ where: { id: targetId }, data: { name, email } });
  res.json(user);
});

app.delete('/users/:id', async (req, res) => {
  const targetId = req.params.id;
  const user = await prisma.user.delete({ where: { id: targetId } });
  res.json(user);
});

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

app.post('/todos', async (req, res) => {
  const { title, userId } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User id is required' });
  }

  const data = {
    title: title.trim(),
    completed: false,
    user: { connect: { id: userId } }
  };

  const newTodo = await prisma.todo.create({ data });

  res.status(201).json(newTodo);
});

app.patch('/todos/:id', async (req, res) => {
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

app.delete('/todos/:id', async (req, res) => {
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
