import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTask, Task, Priority } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Send, Plus, Brain, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TaskSuggestion {
  title: string;
  description: string;
  priority: Priority;
  estimatedTime?: number;
  category?: string;
  tags?: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: TaskSuggestion[];
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content: 'Hello! I can help you manage your tasks more effectively. Try asking me to:',
    suggestions: [
      {
        title: 'Weekly Planning Session',
        description: 'Review and plan tasks for the upcoming week',
        priority: 'high',
        category: 'Planning',
        estimatedTime: 60,
        tags: ['planning', 'weekly']
      },
      {
        title: 'Daily Stand-up Meeting',
        description: 'Quick team sync to discuss progress and blockers',
        priority: 'medium',
        category: 'Meetings',
        estimatedTime: 15,
        tags: ['meeting', 'daily']
      }
    ],
    timestamp: new Date()
  }
];

const SUGGESTION_PROMPTS = [
  'Break down a large task',
  'Suggest related tasks',
  'Prioritize my tasks',
  'Estimate task duration',
  'Create a project timeline',
  'Schedule recurring tasks'
];

const messageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const cardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } }
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export function AISuggestions() {
  const { addTask, tasks } = useTask();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Particle animation
  interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const initParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
      setParticles(newParticles);
    };

    initParticles();

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.fill();

          return particle;
        })
      );

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    // Simulate AI processing
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowercaseMessage = userMessage.toLowerCase();
    let response: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      suggestions: []
    };

    // Analyze existing tasks
    const incompleteTasks = tasks.filter(t => !t.completed);
    const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'high');
    const upcomingDeadlines = incompleteTasks.filter(t => 
      t.dueDate && new Date(t.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000
    );

    if (lowercaseMessage.includes('break down')) {
      response.content = "Here's how you could break down this task:";
      response.suggestions = [
        {
          title: 'Research Phase',
          description: 'Gather information and requirements',
          priority: 'high',
          estimatedTime: 120,
          tags: ['research', 'planning']
        },
        {
          title: 'Implementation',
          description: 'Execute the main task components',
          priority: 'medium',
          estimatedTime: 180,
          tags: ['development']
        },
        {
          title: 'Testing & Review',
          description: 'Verify and validate the results',
          priority: 'medium',
          estimatedTime: 90,
          tags: ['testing']
        }
      ];
    } else if (lowercaseMessage.includes('prioritize')) {
      response.content = "Based on your current tasks, here's what you should focus on:";
      if (highPriorityTasks.length > 0) {
        response.content += "\n\nYou have " + highPriorityTasks.length + " high-priority tasks pending.";
      }
      if (upcomingDeadlines.length > 0) {
        response.content += "\n\nThere are " + upcomingDeadlines.length + " tasks due in the next 3 days.";
      }
    } else if (lowercaseMessage.includes('suggest') || lowercaseMessage.includes('recommend')) {
      response.content = "Here are some suggested tasks based on your current workload:";
      response.suggestions = [
        {
          title: 'Task Review Session',
          description: 'Review and update task priorities and deadlines',
          priority: 'medium',
          estimatedTime: 30,
          tags: ['planning', 'organization']
        },
        {
          title: 'Progress Report',
          description: 'Create a summary of completed and ongoing tasks',
          priority: 'low',
          estimatedTime: 45,
          tags: ['reporting', 'documentation']
        }
      ];
    } else {
      response.content = "I can help you with task management. Try asking me to:";
      response.content += "\n- Break down a complex task";
      response.content += "\n- Prioritize your tasks";
      response.content += "\n- Suggest related tasks";
      response.content += "\n- Create a project timeline";
    }

    setMessages(prev => [...prev, 
      { role: 'user', content: userMessage, timestamp: new Date() },
      response
    ]);
    setIsLoading(false);
  };

  const handleAddTask = (suggestion: TaskSuggestion) => {
    addTask({
      ...suggestion,
      completed: false,
      status: 'todo',
    });
    toast.success('Task added successfully');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    generateResponse(input);
    setInput('');
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-background/50 via-background/80 to-background/50 backdrop-blur-sm rounded-lg border shadow-lg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      />
      <div className="relative z-10 flex flex-col h-full">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  className={`max-w-[80%] rounded-lg p-4 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-card/90 transition-colors'
                  }`}
                  layout
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.suggestions && (
                    <motion.div 
                      className="mt-4 space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {message.suggestions.map((suggestion, i) => (
                        <motion.div
                          key={i}
                          variants={cardVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          className="group"
                        >
                          <Card className="p-4 transition-shadow hover:shadow-xl bg-card/50 backdrop-blur-sm border-muted/20">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
                                  {suggestion.title}
                                </h4>
                                <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                                  {suggestion.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    suggestion.priority === 'high' 
                                      ? 'bg-destructive/20 text-destructive'
                                      : suggestion.priority === 'medium'
                                      ? 'bg-warning/20 text-warning'
                                      : 'bg-success/20 text-success'
                                  }`}>
                                    {suggestion.priority}
                                  </span>
                                  {suggestion.estimatedTime && (
                                    <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {suggestion.estimatedTime}m
                                    </span>
                                  )}
                                  {suggestion.tags?.map((tag, tagIndex) => (
                                    <span 
                                      key={tagIndex}
                                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <motion.div variants={buttonVariants}>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddTask(suggestion)}
                                  className="rounded-full h-8 w-8 p-0"
                                  variant="secondary"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  <div className="mt-2 text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/50">
          <motion.div 
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {SUGGESTION_PROMPTS.map((prompt, i) => (
              <motion.div
                key={i}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(prompt)}
                  className="text-xs bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all"
                >
                  {prompt}
                </Button>
              </motion.div>
            ))}
          </motion.div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Ask for task suggestions..."
              disabled={isLoading}
              className="flex-1 bg-background/50 backdrop-blur-sm focus:bg-background/80 transition-all"
            />
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="relative overflow-hidden"
              >
                {isLoading ? (
                  <motion.div
                    className="absolute inset-0 bg-primary/10"
                    animate={{
                      scale: [1, 1.5],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ) : null}
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Brain className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </div>
  );
} 