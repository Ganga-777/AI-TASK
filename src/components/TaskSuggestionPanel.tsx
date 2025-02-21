import React from 'react';
import { AISuggestions } from './AISuggestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Brain, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export function TaskSuggestionPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="h-full relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 border-primary/10">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-dark/10" />
        
        <CardHeader className="relative">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-2 right-2 text-primary/20"
          >
            <Brain className="h-12 w-12" />
          </motion.div>
          
          <CardTitle className="flex items-center gap-2 text-xl">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="p-1.5 rounded-full bg-primary/10"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              AI Task Suggestions
            </span>
          </CardTitle>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mt-1"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Get intelligent suggestions for your tasks</span>
          </motion.div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent pointer-events-none" />
          <AISuggestions />
        </CardContent>
      </Card>
    </motion.div>
  );
} 