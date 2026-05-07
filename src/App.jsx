import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewDeployment from './pages/NewDeployment';
import DeploymentDetails from './pages/DeploymentDetails';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  
  if (loading) return (
    <div className="loading-state">
      <div className="spinner large"></div>
    </div>
  );
  
  if (!session) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="deploy" element={<NewDeployment />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="deployment/:id" element={<DeploymentDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
