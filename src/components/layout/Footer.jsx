import React from 'react';
import { Box, Typography, Container, Link, Divider, useTheme } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: theme.palette.grey[100], 
        py: 3, 
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, sm: 0 } }}>
            <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
              Privacy Policy
            </Link>
            <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
              Terms of Service
            </Link>
            <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
