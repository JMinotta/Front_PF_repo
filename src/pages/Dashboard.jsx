import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Activity, CheckCircle2, Clock, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEnv, setFilterEnv] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDeployments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDeployments();
      setDeployments(data);
    } catch (err) {
      console.error('Error fetching deployments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancel = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this pending deployment?')) return;
    
    setActionLoading(true);
    try {
      await api.cancelDeployment(id);
      fetchDeployments();
    } catch (err) {
      alert(err.message || 'Failed to cancel deployment');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  // Smart Polling: Only if there are active deployments
  useEffect(() => {
    const hasActive = deployments.some(d => 
      ['PENDING', 'QUEUED', 'RUNNING'].includes(d.status?.toUpperCase())
    );
    
    if (!hasActive) return;

    const interval = setInterval(fetchDeployments, 4000);
    return () => clearInterval(interval);
  }, [deployments]);

  const getStatusIcon = (status) => {
    switch(status?.toUpperCase()) {
      case 'SUCCESS': return <CheckCircle2 size={18} className="text-success" />;
      case 'FAILED': return <XCircle size={18} className="text-danger" />;
      case 'RUNNING': return <RefreshCw size={18} className="text-primary spinner" />;
      case 'ROLLED_BACK': return <AlertCircle size={18} className="text-warning" />;
      case 'QUEUED': return <Clock size={18} className="text-info" />;
      case 'PENDING': return <Clock size={18} className="text-muted" />;
      default: return <Clock size={18} className="text-muted" />;
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

  const getStatusClass = (status) => {
    const statusMap = {
      'RUNNING': 'badge running',
      'SUCCESS': 'badge success',
      'FAILED': 'badge failed',
      'ROLLED_BACK': 'badge rollbacked',
      'QUEUED': 'badge queued',
      'PENDING': 'badge pending'
    };
    return statusMap[status?.toUpperCase()] || 'badge pending';
  };

  const filteredDeployments = deployments.filter(d => {
    const matchesSearch = d.service_name.toLowerCase().includes(search.toLowerCase()) || 
                          d.image.toLowerCase().includes(search.toLowerCase());
    const matchesEnv = filterEnv === 'all' || d.environment === filterEnv;
    return matchesSearch && matchesEnv;
  });

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
          <h1 className="page-title">Panel de Control</h1>
          <p className="page-subtitle">Vista general de tus entornos de despliegue</p>
        </div>
        <button className="btn btn-outline" onClick={fetchDeployments}>
          <RefreshCw size={16} className={loading ? "spinner" : ""} />
          Actualizar
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-primary-light">
            <Activity className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Despliegues Totales</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-success-light">
            <CheckCircle2 className="text-success" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.success}</span>
            <span className="stat-label">Exitosos</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-info-light">
            <RefreshCw className="text-info" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.running}</span>
            <span className="stat-label">En Progreso</span>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-danger-light">
            <XCircle className="text-danger" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.failed}</span>
            <span className="stat-label">Fallidos / Rollbacks</span>
          </div>
        </div>
      </div>

      <div className="deployments-section glass-panel">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h3>Despliegues Recientes</h3>
          
          <div className="filters" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Buscar servicio o imagen..." 
              className="form-control"
              style={{ width: '220px', fontSize: '0.85rem', height: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="form-control" 
              style={{ width: '130px', fontSize: '0.85rem', height: '36px' }}
              value={filterEnv}
              onChange={(e) => setFilterEnv(e.target.value)}
            >
              <option value="all">Todos los Entornos</option>
              <option value="staging">Staging</option>
              <option value="production">Producción</option>
            </select>
          </div>
        </div>
        
        {loading && deployments.length === 0 ? (
          <div className="loading-state">
            <RefreshCw className="spinner" size={32} />
            <p>Cargando despliegues...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="deployments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Servicio</th>
                  <th>Entorno</th>
                  <th>Imagen / Versión</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeployments.map(dep => (
                  <tr key={dep.id} className="table-row">
                    <td className="font-mono text-sm">{dep.id.substring(0, 8)}...</td>
                    <td className="font-medium">{dep.service_name}</td>
                    <td>
                      <span className={`env-badge ${dep.environment}`}>
                        {dep.environment === 'production' ? 'Producción' : 'Staging'}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{dep.image}</td>
                    <td>
                      <span className={getStatusClass(dep.status)}>
                        {getStatusIcon(dep.status)}
                        <span style={{marginLeft: '6px'}}>{getStatusLabel(dep.status)}</span>
                      </span>
                    </td>
                    <td className="text-sm text-secondary">
                      {new Date(dep.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/deployment/${dep.id}`)}
                        >
                          Ver
                        </button>
                        {['PENDING', 'QUEUED'].includes(dep.status?.toUpperCase()) && (
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            onClick={(e) => handleCancel(dep.id, e)}
                            disabled={actionLoading}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDeployments.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No se encontraron despliegues. Crea uno para comenzar.
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
