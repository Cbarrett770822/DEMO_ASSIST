import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Snackbar, Alert } from '@mui/material';
import { selectCurrentUser, loginSuccess } from '../../features/auth/authSlice';
import { checkAndFixAdminRole } from '../../utils/adminUtils';

/**
 * AdminRoleFixer Component
 * 
 * This component checks if the current user should have admin role and fixes it if needed.
 * It's meant to be included in the app layout when the user is logged in.
 */
const AdminRoleFixer = () => {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only run once when the component mounts and if we have a current user
    // with a username and id (fully authenticated)
    if (currentUser && currentUser.username && currentUser.id && !checked) {
      checkAdminRole();
    }
  }, [currentUser, checked]);

  const checkAdminRole = async () => {
    try {
      // Only check if user is authenticated
      if (!currentUser || !currentUser.username) {
        setChecked(true);
        return;
      }
      
      // Check if the user should have admin role
      const result = await checkAndFixAdminRole();
      
      if (result.success) {
        if (result.needsFix && result.user) {
          // If the role was fixed, update the Redux store with the updated user
          dispatch(loginSuccess({
            ...currentUser,
            role: result.user.role
          }));
          
          setMessage('Admin role has been fixed. Please refresh the page to see the changes.');
          setSeverity('success');
          setOpen(true);
        }
      } else {
        console.log('AdminRoleFixer: Role check result:', result.message || 'No details available');
      }
      
      setChecked(true);
    } catch (error) {
      console.log('AdminRoleFixer: Skipping role check until user is fully authenticated');
      setChecked(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      <Snackbar 
        open={open} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              REFRESH
            </Button>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminRoleFixer;
