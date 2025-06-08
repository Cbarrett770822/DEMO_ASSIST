import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CardActionArea,
  Box,
  Chip
} from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { selectProcess } from '../../features/processes/processesSlice';

// Map of icon names to MUI icon components
const iconMap = {
  'warehouse': WarehouseIcon,
  'inventory': InventoryIcon,
  'local_shipping': LocalShippingIcon,
  'shopping_cart': ShoppingCartIcon,
  'assignment_return': AssignmentReturnIcon,
  'inventory_2': Inventory2Icon
};

// Map of categories to colors
const categoryColorMap = {
  'inbound': '#4caf50', // green
  'storage': '#2196f3', // blue
  'outbound': '#ff9800', // orange
  'advanced': '#9c27b0'  // purple
};

const ProcessCard = ({ process }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const IconComponent = iconMap[process.icon] || WarehouseIcon;
  
  const handleCardClick = () => {
    dispatch(selectProcess(process.id));
    navigate(`/flow/${process.id}`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardActionArea 
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        onClick={handleCardClick}
      >
        <Box 
          sx={{ 
            height: 140, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'primary.light',
            position: 'relative'
          }}
        >
          <IconComponent sx={{ fontSize: 80, color: 'white' }} />
          <Chip 
            label={(process.category && typeof process.category === 'string') ? 
              process.category.charAt(0).toUpperCase() + process.category.slice(1) : 
              'General'} 
            size="small" 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              bgcolor: (process.category && categoryColorMap[process.category]) || 'primary.main',
              color: 'white'
            }} 
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography gutterBottom variant="h5" component="div">
            {process.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {process.description}
          </Typography>
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary">
              {process.steps?.length || 0} process flow • {process.metrics?.length || 0} KPI metrics
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProcessCard;
