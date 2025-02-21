export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  tags?: string[];
  archived?: boolean;
  reminder?: Date;
  lastModified?: Date;
} 