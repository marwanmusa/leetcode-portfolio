'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
}>({
  theme: null, // Start with null to avoid hydration mismatch
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// Separate component for theme effects to avoid hydration issues
function ThemeEffects() {
  const { setTheme } = useTheme();

  useEffect(() => {
    try {
      // Check for dark mode preference after component mounts (client-side only)
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDarkMode ? 'dark' : 'light');

      // Listen for changes in color scheme preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      // Fallback to light theme if there's an error
      setTheme('light');
      return () => {};
    }
  }, [setTheme]);

  return null; // This component doesn't render anything
}

// Client-side only component wrapper
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}

// Use a separate component for the theme application to avoid hydration issues
function ThemeApplier() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme to document element
  useEffect(() => {
    if (mounted && theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  return null; // This component doesn't render anything
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Use state to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme | null>(null);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
      <ClientOnly>
        <ThemeEffects />
        <ThemeApplier />
      </ClientOnly>
    </ThemeContext.Provider>
  );
}
