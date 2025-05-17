import React from 'react';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './index';

// Create a custom theme that extends the base theme and suppresses Grid warnings
const customTheme = createTheme({
  ...theme,
  components: {
    ...theme.components,
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

export const ThemeProvider = ({ children }) => {
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
