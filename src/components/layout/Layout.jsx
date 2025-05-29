import React from 'react';
import { Box, CssBaseline, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, onLogout }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh'
    }}>
      <CssBaseline />
      <Header onLogout={onLogout} />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
