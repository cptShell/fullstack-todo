export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type TodoSearchParams = {
  id: string;
};

export type TodoPayload = Omit<Todo, 'id'>;
export type TodoUpdatePayload = Partial<TodoPayload>;
