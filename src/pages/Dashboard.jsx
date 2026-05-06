import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Activity, CheckCircle2, Clock, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const data = await api.getDeployments();
      setDeployments(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deployments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    
    // Auto refresh every 5 seconds for simulation
    const interval = setInterval(fetchDeployments, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'SUCCESS': return <CheckCircle2 size={18} className="text-success" />;
      case 'FAILED': return <XCircle size={18} className="text-danger" />;
      case 'RUNNING': return <RefreshCw size={18} className="text-primary spinner" />;
      case 'ROLLED_BACK': return <AlertCircle size={18} className="text-warning" />;
      case 'QUEUED': return <Clock size={18} className="text-info" />;
      default: return <Clock size={18} className="text-muted" />;
    }
  };

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if(s === 'RUNNING') return 'badge running';
    if(s === 'SUCCESS') return 'badge success';
    if(s === 'FAILED') return 'badge failed';
    if(s === 'ROLLED_BACK') return 'badge rollbacked';
    if(s === 'QUEUED') return 'badge queued';
    return 'badge pending';
  };

  const stats = {
    total: deployments.length,
    success: deployments.filter(d => d.status?.toUpperCase() === 'SUCCESS').length,
    running: deployments.filter(d => ['RUNNING', 'QUEUED', 'PENDING'].includes(d.status?.toUpperCase())).length,
    failed: deployments.filter(d => ['FAILED', 'ROLLED_BACK'].includes(d.status?.toUpperCase())).length,
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your deployment environments</p>
        </div>
        <button className="btn btn-outline" onClick={fetchDeployments}>
          <RefreshCw size={16} className={loading ? "spinner" : ""} />
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-primary-light">
            <Activity className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Deployments</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-success-light">
            <CheckCircle2 className="text-success" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.success}</span>
            <span className="stat-label">Successful</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-info-light">
            <RefreshCw className="text-info" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.running}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-danger-light">
            <XCircle className="text-danger" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.failed}</span>
            <span className="stat-label">Failed / Rollbacks</span>
          </div>
        </div>
      </div>

      <div className="deployments-section glass-panel">
        <div className="section-header">
          <h3>Recent Deployments</h3>
        </div>
        
        {loading && deployments.length === 0 ? (
          <div className="loading-state">
            <RefreshCw className="spinner" size={32} />
            <p>Loading deployments...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="deployments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Environment</th>
                  <th>Image / Version</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map(dep => (
                  <tr key={dep.id} className="table-row">
                    <td className="font-mono text-sm">{dep.id.substring(0, 8)}...</td>
                    <td className="font-medium">{dep.service_name}</td>
                    <td>
                      <span className={`env-badge ${dep.environment}`}>
                        {dep.environment}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{dep.image}</td>
                    <td>
                      <span className={getStatusClass(dep.status)}>
                        {getStatusIcon(dep.status)}
                        <span style={{marginLeft: '6px'}}>{dep.status}</span>
                      </span>
                    </td>
                    <td className="text-sm text-secondary">
                      {new Date(dep.created_at).toLocaleString()}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate(`/deployment/${dep.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {deployments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No deployments found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
