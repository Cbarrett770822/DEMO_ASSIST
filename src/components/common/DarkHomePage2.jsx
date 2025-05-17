import React from 'react';
import { useNavigate } from 'react-router-dom';
import EqualSizeCard from './EqualSizeCard';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  useTheme,
  alpha,
  Divider,
  Stack,
  Avatar,
  Chip,
  Grid
} from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpeedIcon from '@mui/icons-material/Speed';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';

const DarkHomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Define darker colors
  const darkColors = {
    primary: {
      dark: '#0d1b3e',
      main: '#1a3a6a',
      light: '#2c5282'
    },
    secondary: {
      dark: '#7f0000',
      main: '#c62828',
      light: '#ef5350'
    },
    benefits: {
      green: '#1b5e20',
      blue: '#0d47a1',
      orange: '#e65100',
      purple: '#4a148c'
    }
  };

  // Benefit cards data
  const benefitCards = [
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: 'Inventory Accuracy',
      description: 'Improve inventory accuracy to over 99% with real-time tracking and cycle counting',
      color: darkColors.benefits.green,
      stat: '99%+',
      statLabel: 'Accuracy Rate'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Productivity Boost',
      description: 'Increase warehouse productivity by up to 50% through optimized workflows',
      color: darkColors.benefits.blue,
      stat: '50%',
      statLabel: 'Productivity Increase'
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Order Accuracy',
      description: 'Achieve over 99.9% order accuracy with barcode verification and guided processes',
      color: darkColors.benefits.orange,
      stat: '99.9%',
      statLabel: 'Order Accuracy'
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
      title: 'Space Optimization',
      description: 'Optimize warehouse space utilization by up to 30% with intelligent slotting',
      color: darkColors.benefits.purple,
      stat: '30%',
      statLabel: 'Space Savings'
    }
  ];

  // Process category cards data
  const processCards = [
    {
      title: 'Inbound Processes',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: darkColors.benefits.green,
      description: 'Learn how a WMS optimizes receiving, putaway, and quality inspection processes to reduce errors and accelerate dock-to-stock time.',
      processes: ['Receiving', 'Putaway', 'Quality Inspection']
    },
    {
      title: 'Storage Processes',
      icon: <WarehouseIcon sx={{ fontSize: 40 }} />,
      color: darkColors.benefits.blue,
      description: 'Discover how a WMS improves inventory management, cycle counting, and space utilization through intelligent storage strategies.',
      processes: ['Inventory Management', 'Cycle Counting', 'Slotting']
    },
    {
      title: 'Outbound Processes',
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      color: darkColors.benefits.orange,
      description: 'Explore how a WMS streamlines picking, packing, and shipping to increase accuracy and throughput while reducing labor costs.',
      processes: ['Picking', 'Packing', 'Shipping']
    },
    {
      title: 'Returns & Analytics',
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      color: darkColors.benefits.purple,
      description: 'Learn how a WMS handles returns processing efficiently and provides powerful analytics for continuous improvement.',
      processes: ['Returns Processing', 'KPI Tracking', 'Performance Analysis']
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 8,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          background: `linear-gradient(135deg, ${darkColors.primary.dark} 0%, ${darkColors.primary.main} 100%)`,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
        
        <Grid container spacing={0}>
          <Grid xs={12} md={6} sx={{ p: { xs: 4, md: 6 }, position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                color: theme.palette.common.white,
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Master Warehouse Management
            </Typography>
            
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.9),
                fontWeight: 500,
                mb: 3,
                textShadow: '0 1px 5px rgba(0,0,0,0.1)'
              }}
            >
              Interactive tutorials to optimize your warehouse operations
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {[
                'Comprehensive process tutorials',
                'Interactive video demonstrations',
                'Practical implementation guides',
                'Performance metrics & KPIs'
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleIcon sx={{ color: darkColors.secondary.light }} />
                  <Typography variant="body1" sx={{ color: theme.palette.common.white }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/processes')}
                sx={{ 
                  fontWeight: 'medium', 
                  px: 3, 
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(198, 40, 40, 0.4)',
                  bgcolor: darkColors.secondary.main,
                  '&:hover': {
                    bgcolor: darkColors.secondary.dark
                  }
                }}
                endIcon={<ArrowForwardIcon />}
              >
                Explore Processes
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                sx={{ 
                  fontWeight: 'medium', 
                  px: 3, 
                  py: 1.5,
                  color: theme.palette.common.white,
                  borderColor: theme.palette.common.white,
                  '&:hover': {
                    borderColor: theme.palette.common.white,
                    bgcolor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
                endIcon={<InfoIcon />}
              >
                Learn More
              </Button>
            </Stack>
          </Grid>
          
          <Grid xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              <Box
                component="img"
                src="https://img.freepik.com/free-vector/warehouse-workers-carrying-boxes-with-loader_74855-6541.jpg"
                alt="Warehouse Management"
                sx={{
                  width: '90%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                  transform: 'scale(1.1)'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Key Benefits Section */}
      <Box sx={{ mb: 8, maxWidth: '900px', mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: darkColors.primary.main,
              fontWeight: 'bold',
              letterSpacing: 1.5,
              mb: 1,
              display: 'block'
            }}
          >
            KEY BENEFITS
          </Typography>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: darkColors.primary.dark,
              mb: 2
            }}
          >
            Why Implement a WMS?
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto',
              fontSize: '1.1rem'
            }}
          >
            A Warehouse Management System delivers measurable improvements across all areas of your operation, 
            from inventory control to labor productivity and order fulfillment.
          </Typography>
        </Box>
        
        {/* 2x2 Grid for Benefit Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
          gap: 3 
        }}>
          {benefitCards.map((benefit, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <EqualSizeCard height={320}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'all 0.3s',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      transform: 'translateY(-5px)',
                      borderColor: 'transparent'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(benefit.color, 0.1),
                        color: benefit.color,
                        width: 64,
                        height: 64,
                        mb: 2
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '1.25rem', color: darkColors.primary.dark, height: '40px', display: 'flex', alignItems: 'center' }}>
                      {benefit.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, height: '80px', overflow: 'hidden' }}>
                      {benefit.description}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'baseline',
                      mt: 'auto',
                      pt: 2,
                      borderTop: `1px dashed ${theme.palette.divider}`
                    }}>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: benefit.color,
                          mr: 1 
                        }}
                      >
                        {benefit.stat}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {benefit.statLabel}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </EqualSizeCard>
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Process Categories Section */}
      <Box 
        sx={{ 
          mb: 8,
          p: 5,
          borderRadius: 4,
          bgcolor: alpha(darkColors.primary.dark, 0.02),
          border: `1px solid ${alpha(darkColors.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: darkColors.primary.main,
              fontWeight: 'bold',
              letterSpacing: 1.5,
              mb: 1,
              display: 'block'
            }}
          >
            PROCESS CATEGORIES
          </Typography>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: darkColors.primary.dark,
              mb: 2
            }}
          >
            Warehouse Process Tutorials
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto',
              fontSize: '1.1rem'
            }}
          >
            Our tutorials cover the complete warehouse workflow, from receiving to shipping and returns processing.
            Select any category to explore detailed process tutorials.
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ display: 'flex', alignItems: 'stretch' }}>
          {processCards.map((category, index) => (
            <Grid xs={12} md={6} key={index} sx={{ display: 'flex' }}>
              <EqualSizeCard height={380}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                      transform: 'translateY(-5px)',
                      borderColor: 'transparent'
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => navigate('/processes')} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'stretch',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(category.color, 0.1),
                            color: category.color,
                            width: 56,
                            height: 56,
                            mr: 2
                          }}
                        >
                          {category.icon}
                        </Avatar>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 600, color: darkColors.primary.dark }}>
                          {category.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '80px', overflow: 'hidden' }}>
                        {category.description}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ p: 2, bgcolor: alpha(category.color, 0.03), height: '100px', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                        Key Processes:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {category.processes.map((process, idx) => (
                          <Chip 
                            key={idx} 
                            label={process} 
                            size="small" 
                            sx={{ 
                              bgcolor: alpha(category.color, 0.1),
                              color: category.color,
                              fontWeight: 500
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardActionArea>
                </Card>
              </EqualSizeCard>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Call to Action */}
      <Box 
        sx={{ 
          my: 8, 
          py: 8,
          px: 4,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          background: `linear-gradient(135deg, ${darkColors.primary.dark} 0%, ${darkColors.primary.main} 100%)`,
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            zIndex: 0
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid xs={12} md={7}>
              <Box sx={{ color: 'white', textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: alpha(theme.palette.common.white, 0.9),
                    fontWeight: 'bold',
                    letterSpacing: 1.5,
                    mb: 1,
                    display: 'block'
                  }}
                >
                  TAKE THE NEXT STEP
                </Typography>
                <Typography 
                  variant="h2" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    mb: 2,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  Ready to Transform Your Warehouse?
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: '1.1rem', 
                    mb: 4, 
                    opacity: 0.9,
                    lineHeight: 1.6
                  }}
                >
                  Explore our comprehensive tutorials to understand how a WMS can transform your warehouse operations and drive measurable improvements.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate('/processes')}
                    startIcon={<PlayArrowIcon />}
                    sx={{ 
                      py: 1.5, 
                      px: 3, 
                      fontWeight: 600,
                      backgroundColor: theme.palette.common.white,
                      color: darkColors.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.9),
                      }
                    }}
                  >
                    Start Learning
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => navigate('/processes')}
                    startIcon={<ArrowForwardIcon />}
                    sx={{ 
                      py: 1.5, 
                      px: 3, 
                      fontWeight: 600,
                      borderColor: theme.palette.common.white,
                      color: theme.palette.common.white,
                      '&:hover': {
                        borderColor: theme.palette.common.white,
                        backgroundColor: alpha(theme.palette.common.white, 0.1),
                      }
                    }}
                  >
                    Browse Processes
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <Box 
                  sx={{ 
                    width: 300,
                    height: 300,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: alpha(theme.palette.common.white, 0.1),
                      animation: 'pulse 2s infinite'
                    }
                  }}
                >
                  <Box 
                    component="img"
                    src="https://img.icons8.com/color/480/000000/warehouse.png"
                    alt="Warehouse Management"
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                      transform: 'scale(1.2)'
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Add keyframes for the pulse animation */}
      <Box
        sx={{
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(0.95)',
              opacity: 0.7,
            },
            '50%': {
              transform: 'scale(1.05)',
              opacity: 0.3,
            },
            '100%': {
              transform: 'scale(0.95)',
              opacity: 0.7,
            },
          },
        }}
      />
    </Container>
  );
};

export default DarkHomePage;
