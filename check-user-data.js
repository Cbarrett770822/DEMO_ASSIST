// Script to check user data in localStorage
console.log('Checking user data in localStorage...');

// Function to check if localStorage is available
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Function to get and display user data
function checkUserData() {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available in this environment');
    return;
  }

  // Get current user data
  const currentUserData = localStorage.getItem('wms_current_user');
  console.log('Current user data:', currentUserData ? JSON.parse(currentUserData) : 'Not found');

  // Get auth token
  const authToken = localStorage.getItem('wms_auth_token');
  console.log('Auth token exists:', !!authToken);

  // Get session data
  const sessionData = localStorage.getItem('wms_session');
  console.log('Session data:', sessionData ? JSON.parse(sessionData) : 'Not found');
}

// Run the check
checkUserData();
