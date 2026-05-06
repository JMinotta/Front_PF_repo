import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Clock, RotateCcw, CheckCircle2, RefreshCw } from 'lucide-react';
import './Dashboard.css'; // Reuse existing layout styles

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="loading-state">
        <RefreshCw className="spinner" size={32} />
        <p>Calculando métricas operativas...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Estadísticas Operativas</h1>
          <p className="page-subtitle">Métricas de rendimiento para la evaluación del ciclo de vida PaaS</p>
        </div>
        <button className="btn btn-outline" onClick={fetchStats}>
          <RefreshCw size={16} className={loading ? "spinner" : ""} />
          Actualizar
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-primary-light">
            <CheckCircle2 className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.success_rate}%</span>
            <span className="stat-label">Tasa de Éxito</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-info-light">
            <Clock className="text-info" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.avg_duration_seconds}s</span>
            <span className="stat-label">Duración Promedio</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon bg-warning-light">
            <RotateCcw className="text-warning" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.rollback_count}</span>
            <span className="stat-label">Eventos de Rollback</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon bg-success-light">
            <TrendingUp className="text-success" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.mttr_minutes}m</span>
            <span className="stat-label">MTTR (Recuperación)</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '24px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <BarChart3 className="text-primary" size={24} />
          <h3 style={{ margin: 0 }}>Datos Experimentales (Paper DS2)</h3>
        </div>
        
        <div className="metrics-explanation" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p>Este módulo de analítica mide la eficiencia de la plataforma de microservicios DS2. 
             De acuerdo al diseño longitudinal propuesto en el paper, estas métricas representan el estado <strong>"TO-BE"</strong> 
             de la infraestructura, permitiendo la comparación contra métodos de despliegue manual (AS-IS).</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
            <div className="metric-box" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Análisis de Eficiencia</h4>
              <p style={{ fontSize: '14px' }}>El <strong>MTTR actual de {stats?.mttr_minutes} minutos</strong> demuestra una reducción significativa comparado con el promedio de recuperación manual de 15-20 minutos documentado en la Fase 1.</p>
            </div>
            <div className="metric-box" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: 'var(--success)', marginBottom: '8px' }}>Confiabilidad</h4>
              <p style={{ fontSize: '14px' }}>Una <strong>Tasa de Éxito del {stats?.success_rate}%</strong> valida la implementación de health checks y políticas de rollback automatizadas en el worker de Kubernetes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
