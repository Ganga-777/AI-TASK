import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'spinner' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const variants = {
  spinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  dots: {
    y: [0, -5, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function Loading({
  variant = 'default',
  size = 'md',
  text,
  className,
  ...props
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
      {...props}
    >
      {variant === 'default' && (
        <motion.div
          animate={variants.spinner}
          className={cn('text-primary', sizes[size])}
        >
          <Loader2 className="h-full w-full" />
        </motion.div>
      )}

      {variant === 'spinner' && (
        <motion.div
          animate={variants.spinner}
          className={cn(
            'border-4 border-primary/20 border-t-primary rounded-full',
            sizes[size]
          )}
        />
      )}

      {variant === 'dots' && (
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={variants.dots}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'bg-primary rounded-full',
                size === 'sm' && 'h-2 w-2',
                size === 'md' && 'h-3 w-3',
                size === 'lg' && 'h-4 w-4'
              )}
            />
          ))}
        </div>
      )}

      {variant === 'pulse' && (
        <motion.div
          animate={variants.pulse}
          className={cn(
            'bg-primary rounded-full',
            sizes[size]
          )}
        />
      )}

      {text && (
        <p className={cn(
          'text-muted-foreground animate-pulse',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg'
        )}>
          {text}
        </p>
      )}
    </div>
  );
} 