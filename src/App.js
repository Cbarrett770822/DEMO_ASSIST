import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

// Import store
import store from './app/store';

// Import custom ThemeProvider that suppresses Grid warnings
import ThemeProvider from './theme/ThemeProvider';

// Import components
import Layout from './components/layout/Layout';
import DarkHomePage from './components/common/DarkHomePage';
import SettingsPage from './components/settings/SettingsPage';
import ProcessesDashboard from './components/dashboard/ProcessesDashboard';
import FlowPage from './components/tutorials/FlowPage';
import PresentationsPage from './components/common/PresentationsPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<DarkHomePage />} />
              <Route path="/processes" element={<ProcessesDashboard />} />
              <Route path="/flow/:processId" element={<FlowPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/presentations" element={<PresentationsPage />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
