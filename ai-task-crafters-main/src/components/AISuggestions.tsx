import React, { useState, useRef, useEffect } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  Sparkles, 
  Key, 
  AlertCircle, 
  CheckCircle, 
  Lock,
  Send,
  Bot,
  User,
  Plus,
  Stars,
  Zap
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: TaskSuggestion[];
}

interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    darkPrimary: string;
    darkSecondary: string;
    darkAccent: string;
    darkBackground: string;
  };
}

const themes: Theme[] = [
  {
    name: 'Cosmic Night',
    colors: {
      primary: 'from-indigo-600 via-purple-600 to-pink-600',
      secondary: 'from-indigo-900/30 via-purple-900/30 to-pink-900/30',
      accent: 'from-indigo-800/40 to-purple-800/40',
      background: 'from-indigo-950/90 via-purple-950/90 to-pink-950/90',
      darkPrimary: 'from-indigo-400 via-purple-400 to-pink-400',
      darkSecondary: 'from-indigo-800/50 via-purple-800/50 to-pink-800/50',
      darkAccent: 'from-indigo-700/60 to-purple-700/60',
      darkBackground: 'from-indigo-950/95 via-purple-950/95 to-pink-950/95'
    }
  },
  {
    name: 'Aurora Borealis',
    colors: {
      primary: 'from-emerald-600 via-cyan-600 to-blue-600',
      secondary: 'from-emerald-900/30 via-cyan-900/30 to-blue-900/30',
      accent: 'from-emerald-800/40 to-cyan-800/40',
      background: 'from-emerald-950/90 via-cyan-950/90 to-blue-950/90',
      darkPrimary: 'from-emerald-400 via-cyan-400 to-blue-400',
      darkSecondary: 'from-emerald-800/50 via-cyan-800/50 to-blue-800/50',
      darkAccent: 'from-emerald-700/60 to-cyan-700/60',
      darkBackground: 'from-emerald-950/95 via-cyan-950/95 to-blue-950/95'
    }
  },
  {
    name: 'Sunset Fusion',
    colors: {
      primary: 'from-red-600 via-orange-600 to-yellow-600',
      secondary: 'from-red-900/30 via-orange-900/30 to-yellow-900/30',
      accent: 'from-red-800/40 to-orange-800/40',
      background: 'from-red-950/90 via-orange-950/90 to-yellow-950/90',
      darkPrimary: 'from-red-400 via-orange-400 to-yellow-400',
      darkSecondary: 'from-red-800/50 via-orange-800/50 to-yellow-800/50',
      darkAccent: 'from-red-700/60 to-orange-700/60',
      darkBackground: 'from-red-950/95 via-orange-950/95 to-yellow-950/95'
    }
  }
];

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export function AISuggestions() {
  const { addTask } = useTask();
  const [apiKey, setApiKey] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you manage your tasks better. Tell me what kind of tasks you\'re looking to create or ask for suggestions in any area.'
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Particle animation effect
  useEffect(() => {
    if (!isHovered) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize particles
    const initParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
      setParticles(newParticles);
    };
    initParticles();

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Bounce off edges
          if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.fill();

          return particle;
        })
      );

      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrame);
    };
  }, [isHovered]);

  const generateResponse = async (userMessage: string) => {
    if (!apiKey) {
      setError('Please enter your Google API key first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are a helpful task management assistant. Help users organize their tasks and provide suggestions.
                    When suggesting tasks, format them as JSON array of objects with title, description, and priority (low, medium, or high).
                    Keep your responses conversational but concise. If the user asks for task suggestions, include them in your response.
                    Example format for suggestions:
                    [
                      {
                        "title": "Review Project Deliverables",
                        "description": "Go through the project timeline and check all deliverables for the upcoming sprint",
                        "priority": "high"
                      }
                    ]
                    
                    User message: ${userMessage}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to generate response');
      }

      const data = await response.json();
      const assistantMessage = data.candidates[0].content.parts[0].text;
      
      // Try to extract task suggestions if present
      let suggestions: TaskSuggestion[] = [];
      try {
        const jsonMatch = assistantMessage.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // If parsing fails, continue without suggestions
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage.replace(/\[[\s\S]*\]/, '').trim(),
        suggestions
      }]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate response');
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleAddTask = (suggestion: TaskSuggestion) => {
    addTask({
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      completed: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      generateResponse(input.trim());
    }
  };

  if (isConfiguring) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card 
          className="relative overflow-hidden backdrop-blur-lg bg-transparent"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{ opacity: isHovered ? 0.7 : 0.4, transition: 'opacity 0.5s' }}
          />
          <motion.div
            className={`absolute inset-0 -z-10 bg-gradient-to-r ${selectedTheme.colors.background} dark:${selectedTheme.colors.darkBackground}`}
            animate={{
              backgroundSize: isHovered ? "400% 400%" : "200% 200%",
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              animation: "gradient 15s ease infinite",
            }}
          />
          <motion.div
            className={`absolute inset-0 -z-10 bg-gradient-to-br ${selectedTheme.colors.accent} dark:${selectedTheme.colors.darkAccent} backdrop-blur-3xl`}
            animate={{
              opacity: isHovered ? 0.9 : 0.5
            }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative border border-white/10 rounded-lg backdrop-blur-xl bg-white/5 dark:bg-black/5">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className={`flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r ${selectedTheme.colors.primary} dark:${selectedTheme.colors.darkPrimary}`}>
                  <motion.div
                    animate={{
                      rotate: isHovered ? 360 : 0,
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Stars className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  AI Task Assistant (Powered by Gemini)
                </CardTitle>
                <Select
                  value={selectedTheme.name}
                  onValueChange={(value) => setSelectedTheme(themes.find(t => t.name === value) || themes[0])}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(theme => (
                      <SelectItem key={theme.name} value={theme.name}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription className="text-blue-600/80 dark:text-blue-300/80">
                Chat with your AI assistant to get personalized task suggestions and organization help
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50/50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
                <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-300">Google API Key Required</AlertTitle>
                <AlertDescription className="text-blue-600/80 dark:text-blue-300/80">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Complete these steps to use the AI assistant:</p>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Create a Google Cloud account at <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 hover:underline">console.cloud.google.com</a></li>
                        <li>Enable the Gemini API:
                          <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-sm">
                            <li>Go to API & Services</li>
                            <li>Enable Gemini API</li>
                            <li>Create credentials (API key)</li>
                          </ul>
                        </li>
                        <li>Copy your API key and enter it below</li>
                      </ol>
                    </div>
                    <div className="bg-green-50/50 dark:bg-green-950/50 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-300 font-medium">Advantage of Using Gemini:</p>
                      <p className="text-sm text-green-700 dark:text-green-400">Google provides generous free quota for Gemini API usage, making it more cost-effective for task management.</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <label htmlFor="apiKey" className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Google API Key
                        </label>
                        <Lock className="h-4 w-4 text-blue-600/60 dark:text-blue-400/60" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your API key is stored securely in your browser</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  id="apiKey"
          type="password"
                  placeholder="Enter your Google API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono bg-white/50 dark:bg-white/5 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                  className="flex-1 sm:flex-none border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300"
                >
                  Get API Key
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com', '_blank')}
                  className="flex-1 sm:flex-none border-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 text-green-700 dark:text-green-300"
                >
                  Enable Gemini API
                </Button>
              </div>
              <Button
          onClick={() => setIsConfiguring(false)}
          disabled={!apiKey}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Chatting
              </Button>
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card 
        className="min-h-[600px] flex flex-col relative overflow-hidden backdrop-blur-lg bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{ opacity: isHovered ? 0.7 : 0.4, transition: 'opacity 0.5s' }}
        />
        <motion.div
          className={`absolute inset-0 -z-10 bg-gradient-to-r ${selectedTheme.colors.background} dark:${selectedTheme.colors.darkBackground}`}
          animate={{
            backgroundSize: isHovered ? "400% 400%" : "200% 200%",
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            animation: "gradient 15s ease infinite",
          }}
        />
        <div className="relative border border-white/10 rounded-lg backdrop-blur-xl bg-white/5 dark:bg-black/5">
          <CardHeader>
      <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: isHovered ? 360 : 0,
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Stars className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                  AI Task Assistant
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
          onClick={() => setIsConfiguring(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 dark:from-blue-500/10 dark:to-purple-500/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative">Configure</span>
              </Button>
      </div>
            <CardDescription className="text-blue-600/80 dark:text-blue-300/80">
              Chat with your AI assistant for task suggestions and organization help
            </CardDescription>
          </CardHeader>
      
          <CardContent className="flex-1 overflow-y-auto space-y-4">
      {error && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-700 dark:text-red-300">Error</AlertTitle>
                <AlertDescription className="text-red-600/80 dark:text-red-300/80">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'assistant' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white shadow-lg' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </motion.div>
                    <div className="flex-1 space-y-2">
                      <motion.div 
                        whileHover={{ scale: 1.01 }}
                        className={`rounded-lg p-3 shadow-lg backdrop-blur-md ${
                          message.role === 'assistant' 
                            ? 'bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10' 
                            : `bg-gradient-to-r ${selectedTheme.colors.primary} dark:${selectedTheme.colors.darkPrimary} border border-white/20`
                        }`}
                      >
                        {message.content}
                      </motion.div>
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ scale: 1.02, translateX: 5 }}
                              className={`rounded-lg border border-white/20 p-3 backdrop-blur-xl 
                                bg-gradient-to-br ${selectedTheme.colors.secondary} dark:${selectedTheme.colors.darkSecondary}
                                hover:bg-gradient-to-br hover:${selectedTheme.colors.accent} dark:hover:${selectedTheme.colors.darkAccent}
                                transition-all duration-300 shadow-lg hover:shadow-xl`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium text-blue-700 dark:text-blue-300">{suggestion.title}</h4>
                                  <p className="text-sm text-blue-600/80 dark:text-blue-300/80">
                                    {suggestion.description}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      suggestion.priority === 'high' 
                                        ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' 
                                        : suggestion.priority === 'medium' 
                                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300' 
                                          : 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
                                    }`}>
                                      {suggestion.priority} priority
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddTask(suggestion)}
                                  className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>
          </CardContent>
          
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for task suggestions or organization help..."
        disabled={isLoading}
                className="bg-white/5 dark:bg-white/5 border border-white/20 dark:border-white/10 
                  focus:border-white/30 dark:focus:border-white/30 transition-colors backdrop-blur-xl
                  placeholder-white/50 dark:placeholder-white/30 text-white dark:text-white/90"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="relative overflow-hidden group"
              >
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <span className="relative text-white">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </span>
              </Button>
            </form>
          </CardFooter>
        </div>

        {/* Add a subtle glow effect */}
        <motion.div
          className="absolute inset-0 -z-20 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.8 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        />
      </Card>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .backdrop-blur-3xl {
          backdrop-filter: blur(64px);
        }
        
        :root {
          --shadow-glow: 0 0 20px rgba(255, 255, 255, 0.1);
        }
        
        .shadow-glow {
          box-shadow: var(--shadow-glow);
        }
        
        .hover\:shadow-glow:hover {
          box-shadow: var(--shadow-glow);
        }
      `}</style>
    </motion.div>
  );
}
