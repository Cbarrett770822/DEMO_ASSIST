import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip
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

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          mb: 8,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
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
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          <Box sx={{ 
            width: { xs: '100%', md: '50%' }, 
            p: { xs: 4, md: 6 }, 
            position: 'relative', 
            zIndex: 1 
          }}>
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
                  <CheckCircleIcon sx={{ color: theme.palette.secondary.light }} />
                  <Typography variant="body1" sx={{ color: theme.palette.common.white }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/processes')}
                sx={{ 
                  fontWeight: 'bold', 
                  px: 3, 
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(245, 0, 87, 0.4)'
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
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha(theme.palette.common.white, 0.1)
                  }
                }}
                startIcon={<PlayArrowIcon />}
                onClick={() => navigate('/tutorial/receiving')}
              >
                Watch Demo
              </Button>
            </Stack>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '50%' }, display: { xs: 'none', md: 'flex' }, position: 'relative' }}>
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
          </Box>
        </Box>
        
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.4)} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.3)} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />
      </Box>

      {/* Key Benefits Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: 'bold',
              letterSpacing: 1.5,
              mb: 1,
              display: 'block'
            }}
          >
            TRANSFORM YOUR WAREHOUSE
          </Typography>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Why Implement a WMS?
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            A Warehouse Management System delivers measurable improvements across all areas of your operation, 
            from inventory control to labor productivity and order fulfillment.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[
            {
              icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
              title: 'Inventory Accuracy',
              description: 'Improve inventory accuracy to over 99% with real-time tracking and cycle counting',
              color: '#1b5e20', // Darker green
              stat: '99%+',
              statLabel: 'Accuracy Rate'
            },
            {
              icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
              title: 'Productivity Boost',
              description: 'Increase warehouse productivity by up to 50% through optimized workflows',
              color: '#0d47a1', // Darker blue
              stat: '50%',
              statLabel: 'Productivity Increase'
            },
            {
              icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
              title: 'Order Accuracy',
              description: 'Achieve over 99.9% order accuracy with barcode verification and guided processes',
              color: '#e65100', // Darker orange
              stat: '99.9%',
              statLabel: 'Order Accuracy'
            },
            {
              icon: <BarChartIcon sx={{ fontSize: 40 }} />,
              title: 'Space Optimization',
              description: 'Optimize warehouse space utilization by up to 30% with intelligent slotting',
              color: '#4a148c', // Darker purple
              stat: '30%',
              statLabel: 'Space Savings'
            }
          ].map((benefit, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  height: '100%', 
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
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
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                    {benefit.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
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
            </Box>
          ))}
        </Box>
      </Box>

      {/* Process Categories Section */}
      <Box 
        sx={{ 
          mb: 8,
          py: 6,
          px: { xs: 2, md: 6 },
          borderRadius: 4,
          background: `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.primary.light, 0.15)})`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.15)} 0%, transparent 70%)`,
            zIndex: 0
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 'bold',
                letterSpacing: 1.5,
                mb: 1,
                display: 'block'
              }}
            >
              COMPREHENSIVE COVERAGE
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Explore Warehouse Process Categories
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              Our tutorials cover the complete warehouse workflow, from receiving to shipping and returns processing.
              Select any category to explore detailed process tutorials.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {[
              {
                title: 'Inbound Processes',
                icon: <InventoryIcon sx={{ fontSize: 40 }} />,
                color: '#1b5e20', // Darker green
                description: 'Learn how a WMS optimizes receiving, putaway, and quality inspection processes to reduce errors and accelerate dock-to-stock time.',
                processes: ['Receiving', 'Putaway', 'Quality Inspection']
              },
              {
                title: 'Storage Processes',
                icon: <WarehouseIcon sx={{ fontSize: 40 }} />,
                color: '#0d47a1', // Darker blue
                description: 'Discover how a WMS improves inventory management, cycle counting, and space utilization through intelligent storage strategies.',
                processes: ['Inventory Management', 'Cycle Counting', 'Slotting']
              },
              {
                title: 'Outbound Processes',
                icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
                color: '#e65100', // Darker orange
                description: 'Explore how a WMS streamlines picking, packing, and shipping to increase accuracy and throughput while reducing labor costs.',
                processes: ['Picking', 'Packing', 'Shipping']
              },
              {
                title: 'Returns & Analytics',
                icon: <SpeedIcon sx={{ fontSize: 40 }} />,
                color: '#4a148c', // Darker purple
                description: 'Learn how a WMS handles returns processing efficiently and provides powerful analytics for continuous improvement.',
                processes: ['Returns Processing', 'KPI Tracking', 'Performance Analysis']
              }
            ].map((category, index) => (
              <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                      transform: 'translateY(-5px)',
                      borderColor: 'transparent'
                    }
                  }}
                >
                  <CardActionArea 
                    onClick={() => navigate('/processes')} 
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(category.color, 0.1),
                          color: category.color,
                          width: 56,
                          height: 56,
                        }}
                      >
                        {category.icon}
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
                          {category.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ p: 2, bgcolor: alpha(category.color, 0.03) }}>
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
              </Box>
            ))}
          </Box>
        </Box>
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
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
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
            opacity: 0.1,
            backgroundImage: 'url(https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 30% 40%, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 'md', mx: 'auto' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
            <Box sx={{ flex: '1 1 100%', width: '100%', maxWidth: { xs: '100%', md: '58.333%' } }}>
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
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  Ready to Learn More?
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 400, 
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
                      color: theme.palette.primary.main,
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
            </Box>
            
            <Box sx={{ 
              width: { xs: '100%', md: '50%' }, 
              display: { xs: 'none', md: 'block' } 
            }}>
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
            </Box>
          </Box>
        </Box>
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
    </Box>
  );
};

export default HomePage;
