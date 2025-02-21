import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/80 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-lg blur-xl" />
        
        <div className="relative rounded-lg border bg-card/50 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-2"
          >
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-2">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground">
              Login to manage your tasks effectively
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-foreground/80">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border-none bg-background/50 pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-foreground/80">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border-none bg-background/50 pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive bg-destructive/10 p-2.5 rounded-md flex items-center justify-center"
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full rounded-md bg-primary p-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 disabled:opacity-70 transition-all group overflow-hidden"
              >
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      <span>Login</span>
                    </>
                  )}
                </div>
                {!isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-primary-foreground/10"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.5, opacity: 0.15 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </button>
            </motion.div>
          </form>

          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
            <a href="#" className="text-sm text-primary hover:underline block">
              Forgot your password?
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
