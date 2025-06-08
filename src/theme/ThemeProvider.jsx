import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import baseTheme from './index';
import * as unifiedSettingsService from '../services/unifiedSettingsService';

// Create a theme based on the current mode (light/dark)
const createCustomTheme = (mode) => {
  return createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: mode, // 'light' or 'dark'
      ...(mode === 'dark' ? {
        // Dark mode overrides
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
        },
      } : {}), // Light mode uses default palette
    },
    components: {
      ...baseTheme.components,
      MuiGrid: {
        styleOverrides: {
          root: {
            // This will suppress the warnings about deprecated props
            '& .MuiGrid-item': {
              padding: 0,
            },
          },
        },
        defaultProps: {
          // This helps suppress the warnings
          disableStrictModeCompat: true,
        },
      },
    },
  });
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from settings
  const [themeMode, setThemeMode] = useState(unifiedSettingsService.getTheme());
  
  // Create theme based on current mode
  const customTheme = createCustomTheme(themeMode);
  
  useEffect(() => {
    // Function to handle theme changes
    const handleSettingsChange = () => {
      const newTheme = unifiedSettingsService.getTheme();
      if (newTheme !== themeMode) {
        setThemeMode(newTheme);
      }
    };
    
    // Listen for settings-loaded events
    window.addEventListener('settings-loaded', handleSettingsChange);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('settings-loaded', handleSettingsChange);
    };
  }, [themeMode]);
  
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={customTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeProvider;
