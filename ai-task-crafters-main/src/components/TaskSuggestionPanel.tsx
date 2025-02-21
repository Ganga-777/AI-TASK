import React from 'react';
import { AISuggestions } from './AISuggestions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function TaskSuggestionPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          AI Task Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AISuggestions />
      </CardContent>
    </Card>
  );
} 