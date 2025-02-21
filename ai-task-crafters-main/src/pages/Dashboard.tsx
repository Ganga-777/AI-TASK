import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Activity,
  Target,
  BarChart,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TaskList } from '@/components/TaskList';
import { format, subDays, isWithinInterval, startOfDay, endOfDay, differenceInDays } from 'date-fns';

const QuickAction = ({
  icon: Icon,
  title,
  description,
  onClick,
  gradient = "from-blue-500 to-purple-500",
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  gradient?: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <Card className="relative overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-lg">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${gradient} transition-opacity duration-300`} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  </motion.div>
);

export function Dashboard() {
  const { tasks } = useTask();
  const navigate = useNavigate();
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  
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

  // Calculate activity data for the last 7 days
  useEffect(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i);
      const dayTasks = getTasksInDateRange(startOfDay(date), endOfDay(date));
      return {
        date: format(date, 'MMM dd'),
        count: dayTasks.length
      };
    }).reverse();
    setActivityData(last7Days);
  }, [tasks]);

  // Calculate task age distribution
  const taskAgeDistribution = tasks.reduce((acc, task) => {
    const age = differenceInDays(new Date(), new Date(task.createdAt));
    if (age <= 1) acc.new++;
    else if (age <= 7) acc.week++;
    else acc.older++;
    return acc;
  }, { new: 0, week: 0, older: 0 });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome back!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your real-time task dashboard and progress overview.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/tasks/new')} 
          size="lg"
          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={Plus}
          title="Create Task"
          description="Add a new task to your list"
          onClick={() => navigate('/tasks/new')}
          gradient="from-green-500 to-emerald-500"
        />
        <QuickAction
          icon={Star}
          title="Important Tasks"
          description="View your high priority tasks"
          onClick={() => navigate('/tasks?priority=high')}
          gradient="from-red-500 to-pink-500"
        />
        <QuickAction
          icon={Activity}
          title="Task Analytics"
          description="View detailed task insights"
          onClick={() => navigate('/analytics')}
          gradient="from-blue-500 to-indigo-500"
        />
        <QuickAction
          icon={Target}
          title="Goals & Progress"
          description="Track your objectives"
          onClick={() => navigate('/goals')}
          gradient="from-purple-500 to-violet-500"
        />
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-background to-background/80 border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
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

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-500">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-green-500/80">
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

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-yellow-500/80">
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

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-500">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.progress}%</div>
            <div className="mt-2">
              <div className="h-2 bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-blue-500/80">
                <span>{lastWeekTasks.filter(t => t.completed).length} completed this week</span>
                <span>{lastWeekTasks.length} total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Priority Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Activity Overview
                </CardTitle>
                <CardDescription>Task activity for the last 7 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2">
              {activityData.map((day, index) => (
                <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                  <motion.div
                    className="w-full bg-primary/20 rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.count / Math.max(...activityData.map(d => d.count))) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                  <span className="text-xs text-muted-foreground">{day.date}</span>
                  <span className="text-sm font-medium">{day.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Task Distribution
                </CardTitle>
                <CardDescription>Overview by priority and age</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-500">High Priority</span>
                <span className="font-medium">{priorityStats.high}</span>
              </div>
              <div className="h-2 bg-red-100 dark:bg-red-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(priorityStats.high / stats.total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-500">Medium Priority</span>
                <span className="font-medium">{priorityStats.medium}</span>
              </div>
              <div className="h-2 bg-yellow-100 dark:bg-yellow-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(priorityStats.medium / stats.total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-500">Low Priority</span>
                <span className="font-medium">{priorityStats.low}</span>
              </div>
              <div className="h-2 bg-green-100 dark:bg-green-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(priorityStats.low / stats.total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>
                  Your tasks for {format(new Date(), 'MMMM d, yyyy')}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/tasks')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="popLayout">
              {todayTasks.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskList tasks={todayTasks.slice(0, 5)} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks scheduled for today</p>
                  <Button
                    variant="link"
                    onClick={() => navigate('/tasks/new')}
                    className="mt-2"
                  >
                    Create your first task
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* High Priority Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  High Priority
                </CardTitle>
                <CardDescription>
                  Tasks that need immediate attention
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/tasks?priority=high')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="popLayout">
              {highPriorityTasks.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskList tasks={highPriorityTasks.slice(0, 5)} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No high priority tasks</p>
                  <Button
                    variant="link"
                    onClick={() => navigate('/tasks/new')}
                    className="mt-2"
                  >
                    Create a task
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 