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
  res.send(todos);
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

  res.send(targetTodo);
});

app.post('/todos/create', (
  req: express.Request<unknown, unknown, TodoPayload>,
  res
) => {
  const { body } = req;

  const newTodo = { ...body, id: crypto.randomUUID() as string }
  todos.push(newTodo);

  res.status(201).send(newTodo);
});

app.patch('/todos/update/:id', (
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

  res.send(updatedTodo);
});

app.delete('/todos/delete/:id', (req: express.Request<TodoSearchParams>, res) => {
  const targetId = req.params.id;

  if (!targetId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const targetTodoIndex = todos.findIndex(todo => todo.id === targetId);

  if (targetTodoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const removedTodo = todos.splice(targetTodoIndex, 1);

  res.send(removedTodo[0]);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
