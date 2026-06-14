import { create } from 'zustand';

export type ThemeName = 'red' | 'green' | 'blue' | 'yellow' | 'orange';

export interface ThemeConfig {
    name: ThemeName;
    label: string;
    color: string;       // Preview swatch color
}

export const THEME_OPTIONS: ThemeConfig[] = [
    { name: 'red', label: 'Merah', color: '#C1121F' },
    { name: 'green', label: 'Hijau', color: '#16a34a' },
    { name: 'blue', label: 'Biru', color: '#2563eb' },
    { name: 'yellow', label: 'Kuning', color: '#ca8a04' },
    { name: 'orange', label: 'Orange', color: '#ea580c' },
];

interface ThemeStore {
    currentTheme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    applyTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
    currentTheme: 'red',
    setTheme: (theme) => {
        set({ currentTheme: theme });
        // Apply the theme to the document
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    },
    applyTheme: (theme) => {
        set({ currentTheme: theme });
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    },
}));
