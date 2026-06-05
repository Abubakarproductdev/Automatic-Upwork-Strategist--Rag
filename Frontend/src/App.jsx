import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import OverallPerformance from './pages/OverallPerformance';
import ProposalPerformance from './pages/ProposalPerformance';
import ProposalWriting from './pages/ProposalWriting';
import ClientLeadGeneration from './pages/ClientLeadGeneration';
import CustomizeDetails from './pages/CustomizeDetails';
import { JobProvider } from './context/JobContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PromptSettings from './pages/PromptSettings';

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <JobProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OverallPerformance />} />
            <Route path="proposals" element={<ProposalPerformance />} />
            <Route path="write" element={<ProposalWriting />} />
            <Route path="leads" element={<ClientLeadGeneration />} />
            <Route path="profile" element={<CustomizeDetails />} />
            <Route path="ai-prompts" element={<PromptSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </JobProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
