import React, { createContext, useContext, useState, useEffect } from 'react';

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
  getFilteredTasks: (filters: {
    archived?: boolean;
    completed?: boolean;
    priority?: Priority;
    tags?: string[];
    search?: string;
  }) => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        if (prevTasks.length > 0 && Math.random() > 0.7) {
          const taskIndex = Math.floor(Math.random() * prevTasks.length);
          const updatedTasks = [...prevTasks];
          const priorities: Priority[] = ['low', 'medium', 'high'];
          
          updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            priority: priorities[Math.floor(Math.random() * priorities.length)]
          };
          
          return updatedTasks;
        }
        return prevTasks;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substring(2),
      createdAt: new Date(),
      archived: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const editTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const clearCompletedTasks = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  const deleteMultipleTasks = (ids: string[]) => {
    setTasks((prev) => prev.filter((task) => !ids.includes(task.id)));
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
    editTask(id, { archived: true });
  };

  const setTaskReminder = (id: string, date: Date) => {
    editTask(id, { reminder: date });
  };

  const addTaskTag = (id: string, tag: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const currentTags = task.tags || [];
        if (!currentTags.includes(tag)) {
          return { ...task, tags: [...currentTags, tag] };
        }
      }
      return task;
    }));
  };

  const removeTaskTag = (id: string, tag: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id && task.tags) {
        return { ...task, tags: task.tags.filter(t => t !== tag) };
      }
      return task;
    }));
  };

  const getFilteredTasks = ({
    archived = false,
    completed,
    priority,
    tags,
    search,
  }: {
    archived?: boolean;
    completed?: boolean;
    priority?: Priority;
    tags?: string[];
    search?: string;
  }) => {
    return tasks.filter(task => {
      if (task.archived !== archived) return false;
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
      return true;
    });
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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
