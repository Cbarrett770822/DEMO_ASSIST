import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import axios from 'axios';
import config from '../../config';

/**
 * UserList Component
 * 
 * Displays a list of all users in the system with their roles.
 */
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${config.apiUrl}/list-users`);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">User Database</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : users.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>No users found in the database</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle2">Username</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Role</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Created At</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Box 
                      component="span" 
                      sx={{ 
                        bgcolor: user.role === 'admin' ? 'error.light' : 
                                 user.role === 'supervisor' ? 'warning.light' : 'success.light',
                        color: user.role === 'admin' ? 'error.dark' : 
                               user.role === 'supervisor' ? 'warning.dark' : 'success.dark',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 'medium',
                        fontSize: '0.85rem'
                      }}
                    >
                      {user.role}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          This table shows all users in the database with their assigned roles.
          The admin user should have the 'admin' role to access all features.
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserList;
