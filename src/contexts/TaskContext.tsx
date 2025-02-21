import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';
export type SortBy = 'priority' | 'dueDate' | 'createdAt' | 'lastModified';
export type SortOrder = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  tags?: string[];
  archived?: boolean;
  reminder?: Date;
  lastModified?: Date;
  category?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  subtasks?: SubTask[];
  dependencies?: string[]; // Array of task IDs
  attachments?: string[]; // Array of file URLs
  collaborators?: string[]; // Array of user IDs
  notes?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  editTask: (id: string, updates: Partial<Task>) => void;
  clearCompletedTasks: () => void;
  deleteMultipleTasks: (ids: string[]) => void;
  duplicateTask: (id: string) => void;
  archiveTask: (id: string) => void;
  setTaskReminder: (id: string, date: Date) => void;
  addTaskTag: (id: string, tag: string) => void;
  removeTaskTag: (id: string, tag: string) => void;
  getFilteredTasks: (filters: TaskFilters) => Task[];
  getSortedTasks: (tasks: Task[], sortBy: SortBy, order: SortOrder) => Task[];
  getTasksByCategory: (category: string) => Task[];
  getTasksWithUpcomingDeadlines: (days: number) => Task[];
  getOverdueTasks: () => Task[];
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTaskCompletion: (taskId: string, subTaskId: string) => void;
  addTaskDependency: (taskId: string, dependencyId: string) => void;
  removeTaskDependency: (taskId: string, dependencyId: string) => void;
  addTaskCollaborator: (taskId: string, userId: string) => void;
  removeTaskCollaborator: (taskId: string, userId: string) => void;
  setTaskRecurrence: (taskId: string, recurrence: Task['recurrence']) => void;
  lastUpdate: Date | null;
}

interface TaskFilters {
  status?: TaskStatus;
  completed?: boolean;
  priority?: Priority;
  tags?: string[];
  search?: string;
  category?: string;
  collaborator?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { sendUpdate, lastUpdate } = useWebSocket();

  // Load tasks from localStorage on mount with error handling
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        // Validate the tasks array before setting
        if (Array.isArray(parsedTasks) && parsedTasks.every(task => 
          task.id && task.title && typeof task.completed === 'boolean'
        )) {
          setTasks(parsedTasks);
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, []);

  // Save tasks to localStorage with backup
  useEffect(() => {
    try {
      // Create a backup before saving
      const previousTasks = localStorage.getItem('tasks_backup');
      localStorage.setItem('tasks_backup', previousTasks || '[]');
      
      // Save current tasks
      localStorage.setItem('tasks', JSON.stringify(tasks));
      
      // Save timestamp
      localStorage.setItem('tasks_last_saved', new Date().toISOString());
    } catch (error) {
      console.error('Error saving tasks:', error);
      // Attempt to restore from backup
      const backup = localStorage.getItem('tasks_backup');
      if (backup) {
        localStorage.setItem('tasks', backup);
      }
    }
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
      lastModified: new Date(),
      status: 'todo',
      archived: false,
      subtasks: [],
      dependencies: [],
      collaborators: [],
      attachments: [],
    };
    setTasks((prev) => [newTask, ...prev]);
    sendUpdate('add', newTask);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const updatedTask = { 
            ...task, 
            ...updates, 
            lastModified: new Date() 
          };
          sendUpdate('update', updatedTask);
          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete) {
      setTasks(prev => prev.filter(task => task.id !== id));
      sendUpdate('delete', taskToDelete);
    }
  };

  const toggleTaskCompletion = (id: string) => {
    updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed });
  };

  const editTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  const clearCompletedTasks = () => {
    const completedTasks = tasks.filter(task => task.completed);
    setTasks((prev) => prev.filter((task) => !task.completed));
    completedTasks.forEach(task => sendUpdate('delete', task));
  };

  const deleteMultipleTasks = (ids: string[]) => {
    const tasksToDelete = tasks.filter(task => ids.includes(task.id));
    setTasks((prev) => prev.filter((task) => !ids.includes(task.id)));
    tasksToDelete.forEach(task => sendUpdate('delete', task));
  };

  const duplicateTask = (id: string) => {
    const taskToDuplicate = tasks.find(task => task.id === id);
    if (taskToDuplicate) {
      const { id: _, createdAt: __, ...taskData } = taskToDuplicate;
      addTask({
        ...taskData,
        title: `Copy of ${taskData.title}`,
        completed: false,
        archived: false,
      });
    }
  };

  const archiveTask = (id: string) => {
    updateTask(id, { archived: true });
  };

  const setTaskReminder = (id: string, date: Date) => {
    updateTask(id, { reminder: date });
  };

  const addTaskTag = (id: string, tag: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const currentTags = task.tags || [];
      if (!currentTags.includes(tag)) {
        updateTask(id, { tags: [...currentTags, tag] });
      }
    }
  };

  const removeTaskTag = (id: string, tag: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && task.tags) {
      updateTask(id, { tags: task.tags.filter(t => t !== tag) });
    }
  };

  const getFilteredTasks = ({
    status,
    completed,
    priority,
    tags,
    search,
    category,
    collaborator,
    dateRange,
  }: TaskFilters) => {
    return tasks.filter(task => {
      if (status && task.status !== status) return false;
      if (completed !== undefined && task.completed !== completed) return false;
      if (priority && task.priority !== priority) return false;
      if (tags?.length && !tags.some(tag => task.tags?.includes(tag))) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
        );
      }
      if (category && task.category !== category) return false;
      if (collaborator && !task.collaborators?.includes(collaborator)) return false;
      if (dateRange) {
        const { start, end } = dateRange;
        if (task.dueDate && (new Date(task.dueDate) < start || new Date(task.dueDate) > end)) return false;
      }
      return true;
    });
  };

  const getSortedTasks = (tasks: Task[], sortBy: SortBy, order: SortOrder) => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'lastModified':
          if (!a.lastModified) return 1;
          if (!b.lastModified) return -1;
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
      }
      return order === 'asc' ? comparison : -comparison;
    });
  };

  const getTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const getTasksWithUpcomingDeadlines = (days: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) > now && 
      new Date(task.dueDate) <= future
    );
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      !task.completed
    );
  };

  const addSubTask = (taskId: string, title: string) => {
    const subTask: SubTask = {
      id: generateId(),
      title,
      completed: false,
    };
    updateTask(taskId, {
      subtasks: [...(tasks.find(t => t.id === taskId)?.subtasks || []), subTask]
    });
  };

  const toggleSubTaskCompletion = (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.subtasks) {
      const updatedSubtasks = task.subtasks.map(st =>
        st.id === subTaskId ? { ...st, completed: !st.completed } : st
      );
      updateTask(taskId, { subtasks: updatedSubtasks });
    }
  };

  const addTaskDependency = (taskId: string, dependencyId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.dependencies?.includes(dependencyId)) {
      updateTask(taskId, {
        dependencies: [...(task.dependencies || []), dependencyId]
      });
    }
  };

  const removeTaskDependency = (taskId: string, dependencyId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.dependencies) {
      updateTask(taskId, {
        dependencies: task.dependencies.filter(id => id !== dependencyId)
      });
    }
  };

  const addTaskCollaborator = (taskId: string, userId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.collaborators?.includes(userId)) {
      updateTask(taskId, {
        collaborators: [...(task.collaborators || []), userId]
      });
    }
  };

  const removeTaskCollaborator = (taskId: string, userId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.collaborators) {
      updateTask(taskId, {
        collaborators: task.collaborators.filter(id => id !== userId)
      });
    }
  };

  const setTaskRecurrence = (taskId: string, recurrence: Task['recurrence']) => {
    updateTask(taskId, { recurrence });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        editTask,
        clearCompletedTasks,
        deleteMultipleTasks,
        duplicateTask,
        archiveTask,
        setTaskReminder,
        addTaskTag,
        removeTaskTag,
        getFilteredTasks,
        getSortedTasks,
        getTasksByCategory,
        getTasksWithUpcomingDeadlines,
        getOverdueTasks,
        addSubTask,
        toggleSubTaskCompletion,
        addTaskDependency,
        removeTaskDependency,
        addTaskCollaborator,
        removeTaskCollaborator,
        setTaskRecurrence,
        lastUpdate,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
} 