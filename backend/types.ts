export type Todo = {
  id: string;
  text: string;
};

export type TodoSearchParams = {
  id: string;
};

export type TodoPayload = Omit<Todo, 'id'>;
export type TodoUpdatePayload = Partial<TodoPayload>;
