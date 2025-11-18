'use client';

import { useEffect, useState } from 'react';

const THEMES = {
  dark: { label: 'Dark mode', emoji: '🌙' },
  light: { label: 'Light mode', emoji: '☀️' },
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
    }
  }, []);

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className="btn btn--icon"
      type="button"
      title={`Switch to ${THEMES[nextTheme].label}`}
      onClick={() => setTheme(nextTheme)}
    >
      {THEMES[theme].emoji}
    </button>
  );
}
