import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewDeployment from './pages/NewDeployment';
import DeploymentDetails from './pages/DeploymentDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="deploy" element={<NewDeployment />} />
          <Route path="deployment/:id" element={<DeploymentDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
