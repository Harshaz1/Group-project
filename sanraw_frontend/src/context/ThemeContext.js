import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

export const ThemeContext = createContext({
    toggleColorMode: () => { },
    mode: 'light',
});

export const ColorModeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode]
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light Mode Palette
                            primary: { main: '#4caf50' },
                            secondary: { main: '#8bc34a' },
                            background: { default: '#FFFFFF', paper: '#F5F5F5' },
                            text: { primary: '#212121', secondary: '#757575' },
                            divider: '#e0e0e0',
                        }
                        : {
                            // Dark Mode Palette
                            primary: { main: '#66bb6a' },
                            secondary: { main: '#aed581' },
                            background: { default: '#121212', paper: '#1e1e1e' },
                            text: { primary: '#ffffff', secondary: '#b0bec5' },
                            divider: 'rgba(255, 255, 255, 0.12)',
                        }),
                },
                components: {
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                transition: 'background-color 0.3s ease',
                            },
                        },
                    },
                },
                typography: {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontWeight: 700 },
                    h2: { fontWeight: 600 },
                    h6: { fontWeight: 600 },
                },
            }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
