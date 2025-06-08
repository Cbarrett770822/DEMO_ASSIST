import React from 'react';
import { Box, CssBaseline, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import AdminRoleFixer from '../admin/AdminRoleFixer';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

const Layout = ({ children, onLogout }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh'
    }}>
      <CssBaseline />
      {isAuthenticated && <AdminRoleFixer />}
      <Header onLogout={onLogout} />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;
