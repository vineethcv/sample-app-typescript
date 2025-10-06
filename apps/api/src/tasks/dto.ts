export type CreateTaskDto = {
  projectId: string; title: string; description?: string;
  priority?: 'Low'|'Medium'|'High'; dueDate?: string; assigneeId?: string; labelIds?: string[];
};
export type UpdateTaskDto = Partial<Omit<CreateTaskDto,'projectId'|'title'>> & { title?: string; status?: 'Todo'|'InProgress'|'Done' };