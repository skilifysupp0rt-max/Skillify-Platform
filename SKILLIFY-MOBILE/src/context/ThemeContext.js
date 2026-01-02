import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext({});

const darkTheme = {
    bg: '#08090d',
    panel: '#0f1117',
    panelHover: '#161822',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#ffffff',
    textMuted: '#6b7280',
    primary: '#6366f1',
    accent: '#a855f7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
};

const lightTheme = {
    bg: '#f5f5f5',
    panel: '#ffffff',
    panelHover: '#f0f0f0',
    border: 'rgba(0, 0, 0, 0.08)',
    text: '#1a1a1a',
    textMuted: '#6b7280',
    primary: '#6366f1',
    accent: '#a855f7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
};

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(true);
    const theme = isDark ? darkTheme : lightTheme;

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync('theme');
            if (savedTheme) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (e) {
            console.log('Failed to load theme');
        }
    };

    const toggleTheme = async () => {
        const newValue = !isDark;
        setIsDark(newValue);
        await SecureStore.setItemAsync('theme', newValue ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
