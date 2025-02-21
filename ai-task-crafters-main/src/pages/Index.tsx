import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { TaskList } from '@/components/TaskList';
import { CreateTask } from '@/components/CreateTask';
import { TaskSuggestionPanel } from '@/components/TaskSuggestionPanel';
import { LoginForm } from '@/components/LoginForm';
import { motion } from 'framer-motion';

const TaskDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <span className="inline-block text-sm font-medium text-primary/80">
                Task Management System
              </span>
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome, {user?.name}
              </h1>
              <p className="text-muted-foreground">
                Create, organize, and track your tasks with ease
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive hover:bg-destructive/20 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <CreateTask />
              <TaskList />
            </div>
            <div className="space-y-6">
              <TaskSuggestionPanel />
            </div>
          </div>
        </motion.div>
      </div>
    </TaskProvider>
  );
};

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return <TaskDashboard />;
};

const IndexWithAuth = () => {
  return (
    <AuthProvider>
      <Index />
    </AuthProvider>
  );
};

export default IndexWithAuth;
