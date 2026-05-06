import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Rocket, Server, AlertCircle, XCircle, Plus, Trash2, Settings, Globe, Shield } from 'lucide-react';

const NewDeployment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    service_name: '',
    image: '',
    environment: 'staging',
    policy: 'replace',
    health_path: '/',
    container_port: 80
  });

  const [envVars, setEnvVars] = useState([{ key: 'API_URL', value: 'http://host.docker.internal:9000' }]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const handleEnvChange = (index, field, value) => {
    const newVars = [...envVars];
    newVars[index][field] = value;
    setEnvVars(newVars);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.service_name || !formData.image) {
      setError('Service name and Image version are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const envObj = {};
      envVars.forEach(v => {
        if (v.key.trim()) envObj[v.key.trim()] = v.value;
      });

      const payload = {
        ...formData,
        env_vars: envObj
      };
      
      const newDep = await api.createDeployment(payload);
      navigate(`/deployment/${newDep.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create deployment');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">New Deployment</h1>
          <p className="page-subtitle">Configure and launch a new microservice controlled deployment</p>
        </div>
      </div>

      {error && (
        <div className="status-badge" style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#ef4444', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          marginBottom: '24px',
          padding: '16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '40px', border: '1px solid rgba(255,255,255,0.08)' }}>
        
        {/* Sección 1: Identificación */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} className="text-primary" /> Target Service & Image
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">Service Name</label>
              <input
                type="text"
                name="service_name"
                className="form-control"
                placeholder="e.g. auth-service"
                value={formData.service_name}
                onChange={handleChange}
                disabled={loading}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>The exact name of the K8s deployment.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Docker Image / Version</label>
              <input
                type="text"
                name="image"
                className="form-control"
                placeholder="e.g. ds2-frontend:v1.0.0"
                value={formData.image}
                onChange={handleChange}
                disabled={loading}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>Must be loaded in Kind if using real mode.</p>
            </div>
          </div>
        </div>

        {/* Sección 2: Entorno y Política (Tarjetas Grandes) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} /> Target Environment
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['staging', 'production'].map(env => (
                <div 
                  key={env}
                  onClick={() => !loading && setFormData(p => ({...p, environment: env}))}
                  className={`glass-card ${formData.environment === env ? 'active' : ''}`}
                  style={{ 
                    padding: '16px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    background: formData.environment === env ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: formData.environment === env ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    border: '2px solid', 
                    borderColor: formData.environment === env ? 'var(--primary-color)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData.environment === env && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', textTransform: 'capitalize', fontSize: '0.9rem' }}>{env}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {env === 'staging' ? 'Parallel execution allowed' : 'Strict serial queue, health checks'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} /> Deployment Policy
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'replace', label: 'Replace', sub: 'Swaps instances all at once', disabled: false },
                { id: 'canary', label: 'Canary', sub: 'Gradual rollout (Coming soon)', disabled: true }
              ].map(pol => (
                <div 
                  key={pol.id}
                  onClick={() => !loading && !pol.disabled && setFormData(p => ({...p, policy: pol.id}))}
                  className={`glass-card ${formData.policy === pol.id ? 'active' : ''} ${pol.disabled ? 'disabled' : ''}`}
                  style={{ 
                    padding: '16px', 
                    cursor: pol.disabled ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    opacity: pol.disabled ? 0.5 : 1,
                    background: formData.policy === pol.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: formData.policy === pol.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    border: '2px solid', 
                    borderColor: formData.policy === pol.id ? 'var(--primary-color)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData.policy === pol.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                      {pol.label}
                      {pol.disabled && <span style={{ fontSize: '0.65rem', marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>BETA</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pol.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección 3: Configuración K8s */}
        <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} /> Advanced K8s Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Health Check Path</label>
              <input
                type="text"
                name="health_path"
                className="form-control"
                value={formData.health_path}
                onChange={handleChange}
                placeholder="/"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Container Port</label>
              <input
                type="number"
                name="container_port"
                className="form-control"
                value={formData.container_port}
                onChange={(e) => setFormData(p => ({...p, container_port: parseInt(e.target.value) || 80}))}
              />
            </div>
          </div>
        </div>

        {/* Sección 4: Variables de Entorno */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} /> Environment Variables
            </h3>
            <button type="button" onClick={addEnvVar} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Add Variable
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {envVars.map((ev, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: 1, fontSize: '0.85rem' }}
                  placeholder="KEY"
                  value={ev.key}
                  onChange={(e) => handleEnvChange(index, 'key', e.target.value.toUpperCase())}
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: 2, fontSize: '0.85rem' }}
                  placeholder="VALUE"
                  value={ev.value}
                  onChange={(e) => handleEnvChange(index, 'value', e.target.value)}
                />
                <button type="button" onClick={() => removeEnvVar(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ flex: 2, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <><Rocket size={20} /> Launch Deployment</>}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary" style={{ flex: 1, height: '48px' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDeployment;
