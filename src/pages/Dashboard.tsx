import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTask } from '@/contexts/TaskContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  Star,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Flag,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TaskList } from '@/components/TaskList';
import { CreateTask } from '@/components/CreateTask';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

// ... existing QuickAction component ...

export function Dashboard() {
  const { tasks } = useTask();
  const navigate = useNavigate();
  
  // Calculate current stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    progress: tasks.length > 0
      ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
      : 0,
  };

  // Calculate stats for different time periods
  const getTasksInDateRange = (startDate: Date, endDate: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    });
  };

  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const yesterdayStart = startOfDay(subDays(today, 1));
  const yesterdayEnd = endOfDay(subDays(today, 1));
  const lastWeekStart = startOfDay(subDays(today, 7));

  const todayTasks = getTasksInDateRange(todayStart, todayEnd);
  const yesterdayTasks = getTasksInDateRange(yesterdayStart, yesterdayEnd);
  const lastWeekTasks = getTasksInDateRange(lastWeekStart, today);

  // Calculate completion trends
  const todayCompletionRate = todayTasks.length > 0
    ? Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)
    : 0;
  const yesterdayCompletionRate = yesterdayTasks.length > 0
    ? Math.round((yesterdayTasks.filter(t => t.completed).length / yesterdayTasks.length) * 100)
    : 0;
  const completionTrend = todayCompletionRate - yesterdayCompletionRate;

  // Calculate priority distribution
  const priorityStats = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Get high priority tasks
  const highPriorityTasks = tasks.filter((task) => task.priority === 'high' && !task.completed);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your tasks and progress for today.
          </p>
        </div>
        <Button onClick={() => navigate('/tasks/new')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {todayTasks.length} added today
              </p>
              <div className="flex items-center text-xs">
                {todayTasks.length > yesterdayTasks.length ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={todayTasks.length > yesterdayTasks.length ? "text-green-500" : "text-red-500"}>
                  {Math.abs(todayTasks.length - yesterdayTasks.length)} from yesterday
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.completed}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-green-600 dark:text-green-400">
                {todayTasks.filter(t => t.completed).length} completed today
              </p>
              <div className="flex items-center text-xs">
                {completionTrend >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={completionTrend >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(completionTrend)}% from yesterday
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                {todayTasks.filter(t => !t.completed).length} pending today
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-xs">
                  <Flag className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{priorityStats.high} high priority</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Weekly Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.progress}%</div>
            <div className="mt-2">
              <Progress value={stats.progress} className="h-2 bg-blue-100 dark:bg-blue-950">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${stats.progress}%` }} />
              </Progress>
              <div className="flex justify-between mt-1 text-xs text-blue-600 dark:text-blue-400">
                <span>{lastWeekTasks.filter(t => t.completed).length} completed this week</span>
                <span>{lastWeekTasks.length} total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Task breakdown by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-red-600">High Priority</span>
                  <span className="text-sm text-muted-foreground">{priorityStats.high}</span>
                </div>
                <Progress value={(priorityStats.high / stats.total) * 100} className="h-2 bg-red-100">
                  <div className="h-full bg-red-500 transition-all" />
                </Progress>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-yellow-600">Medium Priority</span>
                  <span className="text-sm text-muted-foreground">{priorityStats.medium}</span>
                </div>
                <Progress value={(priorityStats.medium / stats.total) * 100} className="h-2 bg-yellow-100">
                  <div className="h-full bg-yellow-500 transition-all" />
                </Progress>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-green-600">Low Priority</span>
                  <span className="text-sm text-muted-foreground">{priorityStats.low}</span>
                </div>
                <Progress value={(priorityStats.low / stats.total) * 100} className="h-2 bg-green-100">
                  <div className="h-full bg-green-500 transition-all" />
                </Progress>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rest of the dashboard content */}
      // ... existing code ...
    </div>
  );
} 