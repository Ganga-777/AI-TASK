import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ColorScheme = 'cosmic' | 'aurora' | 'sunset' | 'ocean';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorSchemes = {
  cosmic: {
    light: {
      background: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
      foreground: 'from-indigo-600 via-purple-600 to-pink-600',
      accent: 'from-indigo-500 via-purple-500 to-pink-500',
      muted: 'from-indigo-100 via-purple-100 to-pink-100',
    },
    dark: {
      background: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950',
      foreground: 'from-indigo-400 via-purple-400 to-pink-400',
      accent: 'from-indigo-500 via-purple-500 to-pink-500',
      muted: 'from-indigo-900 via-purple-900 to-pink-900',
    },
  },
  aurora: {
    light: {
      background: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
      foreground: 'from-emerald-600 via-teal-600 to-cyan-600',
      accent: 'from-emerald-500 via-teal-500 to-cyan-500',
      muted: 'from-emerald-100 via-teal-100 to-cyan-100',
    },
    dark: {
      background: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950',
      foreground: 'from-emerald-400 via-teal-400 to-cyan-400',
      accent: 'from-emerald-500 via-teal-500 to-cyan-500',
      muted: 'from-emerald-900 via-teal-900 to-cyan-900',
    },
  },
  sunset: {
    light: {
      background: 'bg-gradient-to-br from-orange-50 via-red-50 to-rose-50',
      foreground: 'from-orange-600 via-red-600 to-rose-600',
      accent: 'from-orange-500 via-red-500 to-rose-500',
      muted: 'from-orange-100 via-red-100 to-rose-100',
    },
    dark: {
      background: 'bg-gradient-to-br from-orange-950 via-red-950 to-rose-950',
      foreground: 'from-orange-400 via-red-400 to-rose-400',
      accent: 'from-orange-500 via-red-500 to-rose-500',
      muted: 'from-orange-900 via-red-900 to-rose-900',
    },
  },
  ocean: {
    light: {
      background: 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50',
      foreground: 'from-blue-600 via-sky-600 to-indigo-600',
      accent: 'from-blue-500 via-sky-500 to-indigo-500',
      muted: 'from-blue-100 via-sky-100 to-indigo-100',
    },
    dark: {
      background: 'bg-gradient-to-br from-blue-950 via-sky-950 to-indigo-950',
      foreground: 'from-blue-400 via-sky-400 to-indigo-400',
      accent: 'from-blue-500 via-sky-500 to-indigo-500',
      muted: 'from-blue-900 via-sky-900 to-indigo-900',
    },
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const savedScheme = localStorage.getItem('colorScheme') as ColorScheme;
    return savedScheme || 'cosmic';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Apply color scheme classes
    Object.keys(colorSchemes).forEach(scheme => {
      root.classList.remove(`theme-${scheme}`);
    });
    root.classList.add(`theme-${colorScheme}`);
    
    localStorage.setItem('theme', theme);
    localStorage.setItem('colorScheme', colorScheme);
  }, [theme, colorScheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, setColorScheme }}>
      <div className={`min-h-screen transition-colors duration-300 ${colorSchemes[colorScheme][theme].background}`}>
        <div className="relative">
          {/* Animated background elements */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br opacity-30 animate-gradient-x" />
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute inset-0 bg-noise opacity-[0.015]" />
          </div>
          
          {/* Content */}
          <div className="relative z-0">
            {children}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 