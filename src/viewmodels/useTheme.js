import { useState, useEffect } from 'react';

/**
 * useTheme - ViewModel hook for theme preference management.
 * Handles system preference detection and manual override.
 */
export function useTheme() {
    const [themePref, setThemePref] = useState('system');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateTheme = () => setIsDark(themePref === 'system' ? mediaQuery.matches : themePref === 'dark');

        updateTheme();
        const listener = (e) => { if (themePref === 'system') setIsDark(e.matches); };
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, [themePref]);

    return { themePref, setThemePref, isDark };
}
