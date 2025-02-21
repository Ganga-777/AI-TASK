
import React from 'react';
import { useTask, Task as TaskType } from '@/contexts/TaskContext';
import { TaskCard } from './TaskCard';
import { AnimatePresence, motion } from 'framer-motion';

export function TaskList() {
  const { tasks } = useTask();

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TaskCard task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
