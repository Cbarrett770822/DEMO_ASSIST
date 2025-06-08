import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';

const AboutPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          About Warehouse Management Systems
        </Typography>
        <Typography variant="body1" component="div" align="center">
          Your comprehensive resource for learning about Warehouse Management Systems and optimizing warehouse processes.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' }, minWidth: { xs: '100%', md: 'calc(50% - 16px)' } }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Our Mission
              </Typography>
            </Box>
            <Typography variant="body1" component="div" sx={{ mb: 2 }}>
              This application is dedicated to helping warehouse professionals understand and implement 
              Warehouse Management Systems to optimize their operations. Our mission is to provide clear, 
              practical Flow that demonstrate how WMS technology can transform warehouse processes.
            </Typography>
            <Typography variant="body1" component="div">
              We believe that proper warehouse management is critical for supply chain efficiency, and our 
              goal is to make WMS knowledge accessible to everyone in the industry.
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' }, minWidth: { xs: '100%', md: 'calc(50% - 16px)' } }}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Educational Approach
              </Typography>
            </Box>
            <Typography variant="body1" component="div" sx={{ mb: 2 }}>
              Our Flow are designed with a practical, hands-on approach to learning. Each warehouse process 
              is broken down into clear steps, with video demonstrations showing exactly how a WMS can be used 
              to improve efficiency and accuracy.
            </Typography>
            <Typography variant="body1" component="div">
              Key components of our educational approach include:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Step-by-step video Flow for each warehouse process" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Clear before/after comparisons to show WMS impact" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Practical KPI metrics to measure success" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Real-world benefits and implementation guidance" />
              </ListItem>
            </List>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 100%', width: '100%' }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                About Warehouse Management Systems
              </Typography>
            </Box>
            <Typography variant="body1" component="div" sx={{ mb: 2 }}>
              A Warehouse Management System (WMS) is specialized software that helps organizations control and 
              manage day-to-day warehouse operations, from the moment goods enter a warehouse until they leave. 
              A WMS manages and optimizes all warehouse processes including receiving, putaway, inventory management, 
              picking, packing, shipping, and returns.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Key Benefits of Implementing a WMS:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Increased Inventory Accuracy" 
                      secondary={<Typography component="span" variant="body2">Achieve over 99% inventory accuracy with real-time tracking</Typography>} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Improved Labor Productivity" 
                      secondary={<Typography component="span" variant="body2">Boost warehouse productivity by up to 50% through optimized workflows</Typography>} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Enhanced Order Accuracy" 
                      secondary={<Typography component="span" variant="body2">Achieve over 99.9% order accuracy with barcode verification</Typography>} 
                    />
                  </ListItem>
                </List>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reduced Operating Costs" 
                      secondary={<Typography component="span" variant="body2">Cut labor costs by 10-20% through efficiency improvements</Typography>} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Optimized Space Utilization" 
                      secondary={<Typography component="span" variant="body2">Improve warehouse space utilization by up to 30%</Typography>} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Better Customer Satisfaction" 
                      secondary={<Typography component="span" variant="body2">Improve on-time, in-full delivery rates to over 98%</Typography>} 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default AboutPage;
