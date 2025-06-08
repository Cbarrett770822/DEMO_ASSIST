import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  useTheme, 
  useMediaQuery,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BuildIcon from '@mui/icons-material/Build';
import { selectCurrentUser, selectIsSupervisor, selectIsAdmin } from '../../features/auth/authSlice';

const Header = ({ onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const currentUser = useSelector(selectCurrentUser);
  const isSupervisor = useSelector(selectIsSupervisor);
  const isAdmin = useSelector(selectIsAdmin);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  const isActive = (path) => location.pathname === path;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleOpenUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };
  
  const handleLogout = () => {
    handleCloseUserMenu();
    if (onLogout) onLogout();
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Presentations', path: '/presentations', icon: <SlideshowIcon /> },
    { text: 'Process Flows', path: '/processes', icon: <AccountTreeIcon /> }
  ];
  
  // Add Admin Tools and Settings links for admins only
  if (isAdmin) {
    menuItems.push({ text: 'Admin Tools', path: '/admin/tools', icon: <BuildIcon /> });
    menuItems.push({ text: 'Settings', path: '/settings', icon: <SettingsIcon /> });
  }
  
  // Add User Management link for supervisors and admins
  if (isSupervisor) {
    menuItems.push({ text: 'User Management', path: '/users', icon: <PeopleIcon /> });
  }

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Menu
        </Typography>
        <IconButton onClick={toggleDrawer}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            onClick={toggleDrawer}
            sx={{
              bgcolor: isActive(item.path) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              borderLeft: isActive(item.path) ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: isActive(item.path) ? 'bold' : 'regular',
                color: isActive(item.path) ? theme.palette.primary.main : 'inherit'
              }} 
            />
          </ListItem>
        ))}
        
        {/* Logout button in drawer */}
        <ListItem 
          button={true} 
          onClick={() => {
            toggleDrawer();
            if (onLogout) onLogout();
          }}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(211, 47, 47, 0.04)'
            }
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              color: theme.palette.error.main
            }} 
          />
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Infor WMS Demo by Charles Barrett
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Learn how a Warehouse Management System can transform your operations
        </Typography>
      </Box>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'white', 
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ px: { xs: 0 }, height: 70 }}>
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Avatar 
              sx={{ 
                bgcolor: 'transparent', 
                width: 40, 
                height: 40, 
                mr: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                p: 0,
                overflow: 'hidden'
              }}
            >
              <img 
                src="https://avatars.githubusercontent.com/u/107882909?v=4"
                alt="Charles Barrett"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Avatar>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/" 
              sx={{ 
                textDecoration: 'none', 
                color: theme.palette.text.primary,
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                fontSize: { xs: '1.1rem', md: '1.25rem' }
              }}
            >
              Infor WMS Demo by Charles Barrett
            </Typography>
          </Box>
          
          {/* User Menu */}
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account settings">
              <Button 
                onClick={handleOpenUserMenu} 
                sx={{ 
                  textTransform: 'none',
                  color: 'inherit',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                }}
                endIcon={<ArrowDropDownIcon />}
              >
                <AccountCircleIcon sx={{ mr: 1 }} />
                {currentUser?.name || currentUser?.username}
              </Button>
            </Tooltip>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem 
                component={RouterLink} 
                to="/profile"
                onClick={handleCloseUserMenu}
              >
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>My Profile</ListItemText>
              </MenuItem>
              {isAdmin && [
                <MenuItem 
                  key="admin-tools"
                  component={RouterLink} 
                  to="/admin/tools"
                  onClick={handleCloseUserMenu}
                >
                  <ListItemIcon>
                    <BuildIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Admin Tools</ListItemText>
                </MenuItem>,
                <MenuItem 
                  key="api-diagnostics"
                  component={RouterLink} 
                  to="/debug/api"
                  onClick={handleCloseUserMenu}
                >
                  <ListItemIcon>
                    <BuildIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>API Diagnostics</ListItemText>
                </MenuItem>
              ]}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
          
          {isMobile ? (
            <IconButton 
              edge="end" 
              color="inherit" 
              aria-label="menu"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {menuItems.map((item) => (
                <Button 
                  key={item.text}
                  component={RouterLink} 
                  to={item.path}
                  color={isActive(item.path) ? 'primary' : 'inherit'}
                  sx={{ 
                    fontWeight: isActive(item.path) ? 'bold' : 'medium',
                    mx: 0.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    },
                    ...(isActive(item.path) && {
                      bgcolor: 'rgba(25, 118, 210, 0.08)'
                    })
                  }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </Container>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;
