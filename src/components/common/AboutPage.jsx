import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
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
        <Typography variant="body1" paragraph align="center">
          Your comprehensive resource for learning about Warehouse Management Systems and optimizing warehouse processes.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Our Mission
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              This application is dedicated to helping warehouse professionals understand and implement 
              Warehouse Management Systems to optimize their operations. Our mission is to provide clear, 
              practical Flow that demonstrate how WMS technology can transform warehouse processes.
            </Typography>
            <Typography variant="body1" paragraph>
              We believe that proper warehouse management is critical for supply chain efficiency, and our 
              goal is to make WMS knowledge accessible to everyone in the industry.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                Educational Approach
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              Our Flow are designed with a practical, hands-on approach to learning. Each warehouse process 
              is broken down into clear steps, with video demonstrations showing exactly how a WMS can be used 
              to improve efficiency and accuracy.
            </Typography>
            <Typography variant="body1">
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
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" component="h2">
                About Warehouse Management Systems
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              A Warehouse Management System (WMS) is specialized software that helps organizations control and 
              manage day-to-day warehouse operations, from the moment goods enter a warehouse until they leave. 
              A WMS manages and optimizes all warehouse processes including receiving, putaway, inventory management, 
              picking, packing, shipping, and returns.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Key Benefits of Implementing a WMS:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Increased Inventory Accuracy" 
                      secondary="Achieve over 99% inventory accuracy with real-time tracking" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Improved Labor Productivity" 
                      secondary="Boost warehouse productivity by up to 50% through optimized workflows" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Enhanced Order Accuracy" 
                      secondary="Achieve over 99.9% order accuracy with barcode verification" 
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reduced Operating Costs" 
                      secondary="Cut labor costs by 10-20% through efficiency improvements" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Optimized Space Utilization" 
                      secondary="Improve warehouse space utilization by up to 30%" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Better Customer Satisfaction" 
                      secondary="Improve on-time, in-full delivery rates to over 98%" 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AboutPage;
