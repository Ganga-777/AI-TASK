import React from 'react';
import { Task, useTask } from '@/contexts/TaskContext';
import { motion } from 'framer-motion';
import {
  Check,
  Trash2,
  Clock,
  AlertTriangle,
  Edit2,
  Calendar,
  MoreVertical,
  Copy,
  Share2,
  Flag,
  Archive,
  Star,
  Bell,
  Tags,
  CalendarClock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { EditTaskDialog } from './EditTaskDialog';

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: () => void;
}

type ConfirmationDialog = 'delete' | 'archive' | 'complete' | 'priority' | 'none';

export function TaskCard({ task, isSelected = false, onSelect }: TaskCardProps) {
  const { toggleTaskCompletion, deleteTask, editTask, duplicateTask } = useTask();
  const [activeDialog, setActiveDialog] = React.useState<ConfirmationDialog>('none');
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [pendingPriority, setPendingPriority] = React.useState<Task['priority']>(task.priority);

  const priorityConfig = {
    low: {
      color: 'bg-task-low/10 border-task-low/20 hover:bg-task-low/20',
      icon: Clock,
      text: 'text-task-low',
      badge: 'bg-task-low/20 text-task-low hover:bg-task-low/30',
    },
    medium: {
      color: 'bg-task-medium/10 border-task-medium/20 hover:bg-task-medium/20',
      icon: Clock,
      text: 'text-task-medium',
      badge: 'bg-task-medium/20 text-task-medium hover:bg-task-medium/30',
    },
    high: {
      color: 'bg-task-high/10 border-task-high/20 hover:bg-task-high/20',
      icon: AlertTriangle,
      text: 'text-task-high',
      badge: 'bg-task-high/20 text-task-high hover:bg-task-high/30',
    },
  };

  const config = priorityConfig[task.priority];
  const PriorityIcon = config.icon;

  const handleDelete = () => {
    deleteTask(task.id);
    toast.success('Task deleted successfully');
    setActiveDialog('none');
  };

  const handleDuplicateTask = () => {
    duplicateTask(task.id);
    toast.success('Task duplicated successfully');
  };

  const handleSetReminder = (days: number) => {
    const reminderDate = addDays(new Date(), days);
    editTask(task.id, { dueDate: reminderDate });
    toast.success(`Reminder set for ${format(reminderDate, 'MMM d, yyyy')}`);
  };

  const handleChangePriority = () => {
    editTask(task.id, { priority: pendingPriority });
    toast.success(`Priority changed to ${pendingPriority}`);
    setActiveDialog('none');
  };

  const handleShare = () => {
    const taskDetails = `
Task: ${task.title}
Description: ${task.description}
Priority: ${task.priority}
Status: ${task.completed ? 'Completed' : 'Pending'}
Due: ${task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Not set'}
Tags: ${task.tags?.join(', ') || 'None'}
    `.trim();
    navigator.clipboard.writeText(taskDetails);
    toast.success('Task details copied to clipboard');
  };

  const handleArchive = () => {
    editTask(task.id, { archived: true });
    toast.success('Task archived successfully');
    setActiveDialog('none');
  };

  const handleComplete = () => {
    toggleTaskCompletion(task.id);
    toast.success(`Task marked as ${task.completed ? 'incomplete' : 'complete'}`);
    setActiveDialog('none');
  };

  const handleAddTag = (tag: string) => {
    const currentTags = task.tags || [];
    if (!currentTags.includes(tag)) {
      editTask(task.id, { tags: [...currentTags, tag] });
      toast.success(`Tag "${tag}" added`);
    }
  };

  return (
    <TooltipProvider>
    <motion.div
      className={cn(
          'group relative rounded-xl border p-4 transition-all duration-200',
          config.color,
          task.completed && 'opacity-60',
          isSelected && 'ring-2 ring-primary'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
      >
        <div className="flex items-start gap-4">
          {/* Selection Checkbox */}
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect()}
              className="mt-1"
            />
          )}

          {/* Completion Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
          <button
                onClick={() => setActiveDialog('complete')}
            className={cn(
                  'mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  task.completed
                    ? 'bg-primary border-primary'
                    : 'border-primary/30 hover:border-primary/60'
                )}
              >
                {task.completed && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
          </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{task.completed ? 'Mark as incomplete' : 'Mark as complete'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Task Content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'text-base font-medium transition-colors',
              task.completed && 'line-through text-muted-foreground'
                )}
              >
              {task.title}
            </h3>
              <Badge
                variant="secondary"
                className={cn('text-xs capitalize', config.badge)}
              >
                {task.priority}
              </Badge>
              {task.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </span>
              {task.dueDate && (
                <>
                  <CalendarClock className="h-3 w-3 ml-2" />
                  <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                </>
              )}
              <PriorityIcon className={cn('h-3 w-3 ml-2', config.text)} />
              <span className={config.text}>Priority</span>
            </div>
          </div>

          {/* Enhanced Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="p-2 hover:bg-background rounded-full transition-colors">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveDialog('complete')}>
                <Check className="h-4 w-4 mr-2" />
                Mark as {task.completed ? 'incomplete' : 'complete'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Flag className="h-4 w-4 mr-2" />
                  Set Priority
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup 
                    value={pendingPriority} 
                    onValueChange={(value: Task['priority']) => {
                      setPendingPriority(value);
                      setActiveDialog('priority');
                    }}
                  >
                    <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Bell className="h-4 w-4 mr-2" />
                  Set Reminder
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleSetReminder(1)}>
                    Tomorrow
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetReminder(3)}>
                    In 3 days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetReminder(7)}>
                    In a week
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Tags className="h-4 w-4 mr-2" />
                  Add Tag
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleAddTag('Important')}>
                    Important
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddTag('Personal')}>
                    Personal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddTag('Work')}>
                    Work
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDuplicateTask}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setActiveDialog('archive')}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setActiveDialog('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={activeDialog === 'delete'} onOpenChange={() => setActiveDialog('none')}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the task
                "{task.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
          onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={activeDialog === 'archive'} onOpenChange={() => setActiveDialog('none')}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive "{task.title}"? Archived tasks will be moved
                to the archive section and can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleArchive}>
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Complete/Incomplete Confirmation Dialog */}
        <AlertDialog open={activeDialog === 'complete'} onOpenChange={() => setActiveDialog('none')}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Mark as {task.completed ? 'Incomplete' : 'Complete'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark "{task.title}" as {task.completed ? 'incomplete' : 'complete'}?
                {task.completed && ' This will reopen the task.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleComplete}>
                {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Priority Change Confirmation Dialog */}
        <AlertDialog open={activeDialog === 'priority'} onOpenChange={() => setActiveDialog('none')}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Priority</AlertDialogTitle>
              <AlertDialogDescription>
                Change the priority of "{task.title}" from {task.priority} to {pendingPriority}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleChangePriority}>
                Change Priority
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Task Dialog */}
        <EditTaskDialog
          task={task}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
    </motion.div>
    </TooltipProvider>
  );
}
