import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Container,
  Tabs,
  Tab,
  Paper,
  InputBase,
  IconButton,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ProcessCard from './ProcessCard';
import { 
  selectFilteredProcesses, 
  selectSelectedCategory,
  filterByCategory 
} from '../../features/processes/processesSlice';

const ProcessesDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const processes = useSelector(selectFilteredProcesses);
  const selectedCategory = useSelector(selectSelectedCategory);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Extract category from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryParam = queryParams.get('category');
    
    if (categoryParam && ['all', 'inbound', 'storage', 'outbound', 'advanced'].includes(categoryParam)) {
      dispatch(filterByCategory(categoryParam));
    }
  }, [location.search, dispatch]);

  const handleCategoryChange = (event, newValue) => {
    dispatch(filterByCategory(newValue));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProcesses = searchTerm 
    ? processes.filter(process => 
        process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : processes;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Warehouse Management System Processes
      </Typography>
      
      <Typography variant="body1" component="div" align="center" sx={{ mb: 4 }}>
        Explore the key warehouse processes and learn how a Warehouse Management System (WMS) can optimize each one.
        Select any process to view detailed Flow, benefits, and KPI metrics.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: { xs: '100%', md: 300 } }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search processes"
            inputProps={{ 'aria-label': 'search processes' }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
        
        <Box sx={{ flexGrow: 1 }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="process categories"
          >
            <Tab label="All Processes" value="all" />
            <Tab label="Inbound" value="inbound" />
            <Tab label="Storage" value="storage" />
            <Tab label="Outbound" value="outbound" />
            <Tab label="Advanced" value="advanced" />
          </Tabs>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {filteredProcesses.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredProcesses.map((process) => (
            <Box key={process.id} sx={{ 
              flex: '1 1 calc(33.33% - 16px)', 
              minWidth: { 
                xs: '100%', 
                sm: 'calc(50% - 16px)', 
                md: 'calc(33.33% - 16px)' 
              } 
            }}>
              <ProcessCard process={process} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">
            No processes found matching "{searchTerm}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try a different search term or category
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ProcessesDashboard;
