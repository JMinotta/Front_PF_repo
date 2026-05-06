import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, Clock, CheckCircle2, XCircle, RotateCcw, ArrowUpCircle, RefreshCw } from 'lucide-react';
import './DeploymentDetails.css';

const DeploymentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deployment, setDeployment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRollbackModal, setShowRollbackModal] = useState(false);


  const fetchDeployment = async () => {
    try {
      const data = await api.getDeploymentById(id);
      setDeployment(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deployment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployment();
  }, [id]);

  useEffect(() => {
    if (!deployment) return;
    const isActive = ['PENDING', 'QUEUED', 'RUNNING'].includes(deployment.status?.toUpperCase());
    if (!isActive) return;
    const interval = setInterval(fetchDeployment, 3000);
    return () => clearInterval(interval);
  }, [deployment?.status]);

  const handlePromote = async () => {
    setActionLoading(true);
    try {
      const newDep = await api.promoteToProduction(id);
      navigate(`/deployment/${newDep.id}`);
    } catch (err) {
      setError(err.message || 'Failed to promote deployment');
      setActionLoading(false);
    }
  };

  const handleRollback = async () => {
    setActionLoading(true);
    setShowRollbackModal(false);
    try {
      await api.executeRollback(id);
      fetchDeployment();
    } catch (err) {
      setError(err.message || 'Failed to execute rollback');
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this pending deployment?')) return;
    setActionLoading(true);
    try {
      await api.cancelDeployment(id);
      fetchDeployment();
    } catch (err) {
      setError(err.message || 'Failed to cancel deployment');
      setActionLoading(false);
    }
  };

  if (loading && !deployment) {
    return (
      <div className="loading-state">
        <RefreshCw className="spinner" size={32} />
        <p>Loading deployment details...</p>
      </div>
    );
  }

  if (error && !deployment) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const getEventIcon = (event, isLast) => {
    // If it's the last event and the deployment is still running/queued, show spinner
    const s = deployment?.status?.toUpperCase();
    if (isLast && ['RUNNING', 'QUEUED', 'PENDING'].includes(s)) {
      return <RefreshCw size={14} className="spinner text-primary" />;
    }

    switch (event.event_type) {
      case 'REQUEST_CREATED':
      case 'ENQUEUED':
        return <Clock size={14} className="text-info" />;
      case 'STARTED':
        return <RefreshCw size={14} className="text-primary" />;
      case 'HEALTHCHECK_OK':
      case 'ROLLBACK_OK':
      case 'FINISHED':
        return <CheckCircle2 size={14} className="text-success" />;
      case 'HEALTHCHECK_FAIL':
      case 'ERROR':
      case 'ROLLBACK_STARTED':
        return <XCircle size={14} className="text-danger" />;
      default:
        // Fallback checks
        if (event.event_status === 'FAILED' || event.message?.toLowerCase().includes('fail') || event.message?.toLowerCase().includes('rollback')) {
          return <XCircle size={14} className="text-danger" />;
        }
        return <CheckCircle2 size={14} className="text-success" />;
    }
  };

  const s = deployment?.status?.toUpperCase();

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Deployment {deployment.id.substring(0, 8)}</h1>
            <span className={`badge ${s?.toLowerCase().replace('_', '')}`}>
              {deployment.status}
            </span>
          </div>
        </div>

        <div className="deployment-actions">
          {s === 'SUCCESS' && (
            <a
              href={`http://${deployment.service_name}.paas.local`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ color: 'var(--success)', borderColor: 'var(--success-bg)' }}
              title="Ensure your hosts file or Kind Ingress is configured"
            >
              Open App
            </a>
          )}

          {deployment.environment === 'staging' && s === 'SUCCESS' && (
            <button
              className="btn btn-primary"
              onClick={handlePromote}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : <><ArrowUpCircle size={16} /> Promote to Production</>}
            </button>
          )}

          {(s === 'SUCCESS' || s === 'FAILED') && (
            <button
              className="btn btn-danger"
              onClick={() => setShowRollbackModal(true)}
              disabled={actionLoading}
            >
              <RotateCcw size={16} /> Execute Rollback
            </button>
          )}

          {['PENDING', 'QUEUED'].includes(s) && (
            <button
              className="btn btn-outline"
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <XCircle size={16} /> Cancel Deployment
            </button>
          )}
        </div>
      </div>

      <div className="details-grid">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title">Deployment Info</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Service</span>
              <span className="info-value font-medium">{deployment.service_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Environment</span>
              <span className={`env-badge ${deployment.environment}`} style={{ alignSelf: 'flex-start' }}>
                {deployment.environment}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Policy</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>
                {deployment.policy || 'Replace'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Image Version</span>
              <span className="info-value font-mono">{deployment.image}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Requested By</span>
              <span className="info-value">{deployment.requested_by_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Created At</span>
              <span className="info-value">{new Date(deployment.created_at).toLocaleString()}</span>
            </div>
            {s === 'FAILED' && deployment.error_message && (
              <div className="info-item" style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                <span className="info-label text-danger">Error Details</span>
                <div style={{ backgroundColor: 'var(--danger-bg)', padding: '12px', borderRadius: '4px', borderLeft: '3px solid var(--danger)', marginTop: '8px', color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {deployment.error_message}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title">Execution Timeline</h3>
          <div className="timeline">
            {deployment.events.map((event, idx) => (
              <div key={idx} className={`timeline-item ${idx === deployment.events.length - 1 ? 'last' : ''}`}>
                <div className="timeline-marker">
                  {getEventIcon(event, idx === deployment.events.length - 1)}
                </div>
                <div className="timeline-content">
                  <p className="timeline-message">{event.message}</p>
                  <span className="timeline-time">{new Date(event.created_at || event.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h2 className="modal-title">Confirm Rollback</h2>
            <p className="modal-body">
              Are you sure you want to rollback deployment <strong>{deployment.id.substring(0, 8)}...</strong> for <strong>{deployment.service_name}</strong>?
              This action will restore the previous stable version in {deployment.environment}.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowRollbackModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleRollback}>Yes, Execute Rollback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentDetails;
