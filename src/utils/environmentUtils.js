/**
 * Environment Utilities
 * 
 * This module provides utilities for working with environment detection
 * and configuration across the application.
 */

import config from '../config';

/**
 * Check if the current environment is development
 * @returns {boolean} - True if development, false otherwise
 */
export const isDevelopmentEnvironment = () => {
  // Check NODE_ENV
  if (process.env.NODE_ENV === 'development') return true;
  
  // Check REACT_APP_DEV_MODE
  if (process.env.REACT_APP_DEV_MODE === 'true') return true;
  
  // Check hostname for local development
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  }
  
  // Default to false (production)
  return false;
};

/**
 * Get the appropriate API base URL based on environment
 * @returns {string} - API base URL
 */
export const getApiBaseUrl = () => {
  // Use the API URL from config.js if available
  if (config && config.apiUrl) {
    console.log('Using API URL from config:', config.apiUrl);
    return config.apiUrl;
  }
  
  // If we're in development and using a proxy, use the relative path
  // This ensures requests go through the React development server's proxy
  if (isDevelopmentEnvironment() && window.location.port === '3001') {
    console.log('Using proxy-compatible API URL: /api');
    return '/api';
  }
  
  // Fallback to direct function URLs when not using proxy
  if (isDevelopmentEnvironment()) {
    return 'http://localhost:8889/.netlify/functions';
  }
  return 'https://wms-tutorial-app.netlify.app/.netlify/functions';
};

/**
 * Get environment name
 * @returns {string} - Environment name ('development' or 'production')
 */
export const getEnvironmentName = () => {
  return isDevelopmentEnvironment() ? 'development' : 'production';
};

/**
 * Check if we should use development fallbacks
 * @returns {boolean} - True if should use fallbacks, false otherwise
 */
export const shouldUseDevelopmentFallbacks = () => {
  // Check if fallbacks are explicitly disabled via config
  if (config && config.development && config.development.disableFallback === true) {
    console.log('Development fallbacks explicitly disabled via config');
    return false;
  }
  
  // Check environment variables
  if (process.env.DISABLE_DEV_FALLBACK === 'true') {
    console.log('Development fallbacks disabled via DISABLE_DEV_FALLBACK environment variable');
    return false;
  }
  
  // Default behavior - allow fallbacks in development unless explicitly disabled
  return isDevelopmentEnvironment() && (
    process.env.REACT_APP_USE_DEV_FALLBACKS === 'true' || 
    !process.env.REACT_APP_USE_DEV_FALLBACKS
  );
};
