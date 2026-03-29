import express from "express";
import crypto from "crypto";
import cors from "cors";
import { todos } from "./data.ts";
import { TodoPayload, TodoSearchParams, TodoUpdatePayload } from "./types.ts";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/todos', (req, res) => {
  const completed = req.query.completed;

  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    res.json(todos.filter(todo => todo.completed === isCompleted));
    return;
  }

  res.json(todos);
});

app.get('/todos/:id', (req, res) => {
  const targetId = req.params.id;
  console.log(targetId);
  if (!targetId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const targetTodo = todos.find(todo => todo.id === targetId);

  if (!targetTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(targetTodo);
});

app.post('/todos', (
  req: express.Request<unknown, unknown, TodoPayload>,
  res
) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTodo = {
    text,
    id: crypto.randomUUID() as string,
    completed: false,
  };
  todos.push(newTodo);

  res.status(201).json(newTodo);
});

app.patch('/todos/:id', (
  req: express.Request<TodoSearchParams, unknown, TodoUpdatePayload>,
  res
) => {
  const targetId = req.params.id;
  const payload = req.body;

  if (!targetId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const targetTodoIndex = todos.findIndex(todo => todo.id === targetId);

  if (targetTodoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updatedTodo = { ...todos[targetTodoIndex], ...payload };

  todos[targetTodoIndex] = updatedTodo;

  res.json(updatedTodo);
});

app.delete('/todos/:id', (req: express.Request<TodoSearchParams>, res) => {
  const targetId = req.params.id;

  if (!targetId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const targetTodoIndex = todos.findIndex(todo => todo.id === targetId);

  if (targetTodoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const removedTodo = todos.splice(targetTodoIndex, 1);

  res.json(removedTodo[0]);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
