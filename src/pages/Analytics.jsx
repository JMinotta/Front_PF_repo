import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Clock, RotateCcw, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import './Dashboard.css'; // Reuse existing layout styles

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <RefreshCw className="spinner" size={32} />
        <p>Calculating operational metrics...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Operational Analytics</h1>
          <p className="page-subtitle">Performance metrics for PaaS lifecycle evaluation</p>
        </div>
        <button className="btn btn-outline" onClick={fetchStats}>
          <RefreshCw size={16} className={loading ? "spinner" : ""} />
          Refresh Stats
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-primary-light">
            <CheckCircle2 className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.success_rate}%</span>
            <span className="stat-label">Success Rate</span>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon bg-info-light">
            <Clock className="text-info" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.avg_duration_seconds}s</span>
            <span className="stat-label">Avg. Deploy Duration</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon bg-warning-light">
            <RotateCcw className="text-warning" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.rollback_count}</span>
            <span className="stat-label">Rollback Events</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon bg-success-light">
            <TrendingUp className="text-success" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.mttr_minutes}m</span>
            <span className="stat-label">MTTR (Avg Recovery)</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '24px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <BarChart3 className="text-primary" size={24} />
          <h3 style={{ margin: 0 }}>Experimental Data (Paper DS2)</h3>
        </div>
        
        <div className="metrics-explanation" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <p>This analytics module measures the efficiency of the DS2 microservices platform. 
             According to the longitudinal design proposed in the paper, these metrics represent the <strong>"TO-BE"</strong> state 
             of the infrastructure, allowing comparison against manual deployment methods (AS-IS).</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
            <div className="metric-box" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Efficiency Analysis</h4>
              <p style={{ fontSize: '14px' }}>The current <strong>MTTR of {stats?.mttr_minutes} minutes</strong> demonstrates a significant reduction compared to the manual recovery average of 15-20 minutes documented in Phase 1.</p>
            </div>
            <div className="metric-box" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ color: 'var(--success)', marginBottom: '8px' }}>Reliability</h4>
              <p style={{ fontSize: '14px' }}>A <strong>Success Rate of {stats?.success_rate}%</strong> validates the implementation of health checks and automated rollback policies in the Kubernetes worker.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
