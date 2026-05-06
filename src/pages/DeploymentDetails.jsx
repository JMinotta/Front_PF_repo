import { useState, useEffect, useCallback } from 'react';
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

  const fetchDeployment = useCallback(async () => {
    try {
      const data = await api.getDeploymentById(id);
      setDeployment(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching deployment:', err);
      setError('Error al cargar los detalles del despliegue');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) await fetchDeployment();
    };
    load();
    return () => { isMounted = false; };
  }, [fetchDeployment]);

  useEffect(() => {
    if (!deployment) return;
    const isActive = ['PENDING', 'QUEUED', 'RUNNING'].includes(deployment.status?.toUpperCase());
    if (!isActive) return;
    const interval = setInterval(fetchDeployment, 3000);
    return () => clearInterval(interval);
  }, [deployment, fetchDeployment]);

  const handlePromote = async () => {
    setActionLoading(true);
    try {
      const newDep = await api.promoteToProduction(id);
      navigate(`/deployment/${newDep.id}`);
    } catch (err) {
      setError(err.message || 'Error al promover el despliegue');
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
      setError(err.message || 'Error al ejecutar el rollback');
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este despliegue pendiente?')) return;
    setActionLoading(true);
    try {
      await api.cancelDeployment(id);
      fetchDeployment();
    } catch (err) {
      setError(err.message || 'Error al cancelar el despliegue');
      setActionLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'RUNNING': 'En curso',
      'SUCCESS': 'Exitoso',
      'FAILED': 'Fallido',
      'ROLLED_BACK': 'Revertido',
      'QUEUED': 'En cola',
      'PENDING': 'Pendiente'
    };
    return labels[status?.toUpperCase()] || status;
  };

  if (loading && !deployment) {
    return (
      <div className="loading-state">
        <RefreshCw className="spinner" size={32} />
        <p>Cargando detalles del despliegue...</p>
      </div>
    );
  }

  if (error && !deployment) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Volver al Panel</button>
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
            <ArrowLeft size={16} /> Volver al Panel
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Despliegue {deployment.id.substring(0, 8)}</h1>
            <span className={`badge ${s?.toLowerCase().replace('_', '')}`}>
              {getStatusLabel(deployment.status)}
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
              title="Asegúrate de que tu archivo hosts o Kind Ingress esté configurado"
            >
              Abrir App
            </a>
          )}

          {deployment.environment === 'staging' && s === 'SUCCESS' && (
            <button
              className="btn btn-primary"
              onClick={handlePromote}
              disabled={actionLoading}
            >
              {actionLoading ? 'Procesando...' : <><ArrowUpCircle size={16} /> Promover a Producción</>}
            </button>
          )}

          {(s === 'SUCCESS' || s === 'FAILED') && (
            <button
              className="btn btn-danger"
              onClick={() => setShowRollbackModal(true)}
              disabled={actionLoading}
            >
              <RotateCcw size={16} /> Ejecutar Rollback
            </button>
          )}

          {['PENDING', 'QUEUED'].includes(s) && (
            <button
              className="btn btn-outline"
              style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <XCircle size={16} /> Cancelar Despliegue
            </button>
          )}
        </div>
      </div>

      <div className="details-grid">
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title">Información del Despliegue</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Servicio</span>
              <span className="info-value font-medium">{deployment.service_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Entorno</span>
              <span className={`env-badge ${deployment.environment}`} style={{ alignSelf: 'flex-start' }}>
                {deployment.environment === 'production' ? 'Producción' : 'Staging'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Política</span>
              <span className="info-value" style={{ textTransform: 'capitalize' }}>
                {deployment.policy === 'replace' ? 'Reemplazo' : deployment.policy}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Imagen / Versión</span>
              <span className="info-value font-mono">{deployment.image}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Solicitado por</span>
              <span className="info-value">{deployment.requested_by_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Creado el</span>
              <span className="info-value">{new Date(deployment.created_at).toLocaleString()}</span>
            </div>
            {s === 'FAILED' && deployment.error_message && (
              <div className="info-item" style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                <span className="info-label text-danger">Detalles del Error</span>
                <div style={{ backgroundColor: 'var(--danger-bg)', padding: '12px', borderRadius: '4px', borderLeft: '3px solid var(--danger)', marginTop: '8px', color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {deployment.error_message}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 className="section-title">Línea de Tiempo</h3>
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
            <h2 className="modal-title">Confirmar Rollback</h2>
            <p className="modal-body">
              ¿Estás seguro de que deseas revertir el despliegue <strong>{deployment.id.substring(0, 8)}...</strong> del servicio <strong>{deployment.service_name}</strong>?
              Esta acción restaurará la versión estable anterior en {deployment.environment === 'production' ? 'Producción' : 'Staging'}.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowRollbackModal(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleRollback}>Sí, Ejecutar Rollback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentDetails;
