import React, { useState } from 'react';
import { Priority, useTask } from '@/contexts/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Clock, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CreateTask() {
  const { addTask } = useTask();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags,
    });

    toast.success('Task created successfully');
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setTags([]);
    setNewTag('');
    setIsExpanded(false);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? 'auto' : '48px' }}
      className="rounded-lg border bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="create-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="flex w-full items-center gap-2 p-3 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="flex items-center gap-2 px-2">
              <motion.div
                animate={{ rotate: isExpanded ? 45 : 0 }}
                className="p-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors"
              >
                <Plus className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="font-medium">Create new task</span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="create-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border-none bg-background/50 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
                
                <textarea
                  placeholder="Task description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border-none bg-background/50 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-none"
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            priority === p
                              ? p === 'high'
                                ? 'bg-destructive/20 text-destructive'
                                : p === 'medium'
                                ? 'bg-warning/20 text-warning'
                                : 'bg-success/20 text-success'
                              : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground/80">
                      Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded-md border-none bg-background/50 pl-10 pr-4 py-1.5 text-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80">
                    Tags
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tags (press Enter)"
                      className="w-full rounded-md border-none bg-background/50 pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
