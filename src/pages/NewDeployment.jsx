import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Rocket, Server, AlertCircle, XCircle } from 'lucide-react';

const NewDeployment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    service_name: '',
    image: '',
    environment: 'staging',
    policy: 'replace'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const payload = {
        service_name: formData.service_name,
        image: formData.image,
        environment: formData.environment,
        policy: formData.policy,
      };
      
      // Enviar envVars si las hay, convirtiéndolas en objeto o array si el backend lo requiere.
      // Si el backend no lo requiere aún, se enviarán como extra properties o se ignorarán.
      
      const newDep = await api.createDeployment(payload);
      navigate(`/deployment/${newDep.id}`);
    } catch (err) {
      if (err.message?.includes('RabbitMQ no disponible') || err.message?.includes('RabbitMQ')) {
        setError('Sistema de mensajería fuera de línea. El despliegue quedará pendiente.');
      } else {
        setError(err.message || 'Failed to create deployment');
      }
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">New Deployment</h1>
          <p className="page-subtitle">Request a controlled deployment to your environments</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--danger-bg)',
            borderLeft: '4px solid var(--danger)',
            color: '#fca5a5',
            marginBottom: '24px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="service">Target Service</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Server size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  id="service_name"
                  name="service_name"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="e.g. auth-service, payment-api"
                  value={formData.service_name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              The exact name of the Kubernetes deployment/service to update.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="image">Docker Image / Version</label>
            <input
              type="text"
              id="image"
              name="image"
              className="form-control"
              placeholder="e.g. registry.company.com/auth-service:v1.2.4"
              value={formData.image}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Environment</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <label 
                style={{
                  flex: 1,
                  padding: '16px',
                  border: `2px solid ${formData.environment === 'staging' ? 'var(--info)' : 'var(--border-color)'}`,
                  backgroundColor: formData.environment === 'staging' ? 'var(--info-bg)' : 'transparent',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="environment"
                  value="staging"
                  checked={formData.environment === 'staging'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--info)', width: '18px', height: '18px' }}
                  disabled={loading}
                />
                <div>
                  <div style={{ fontWeight: 600, color: formData.environment === 'staging' ? 'white' : 'var(--text-primary)' }}>Staging</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Parallel execution allowed</div>
                </div>
              </label>

              <label 
                style={{
                  flex: 1,
                  padding: '16px',
                  border: `2px solid ${formData.environment === 'production' ? 'var(--danger)' : 'var(--border-color)'}`,
                  backgroundColor: formData.environment === 'production' ? 'var(--danger-bg)' : 'transparent',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="environment"
                  value="production"
                  checked={formData.environment === 'production'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--danger)', width: '18px', height: '18px' }}
                  disabled={loading}
                />
                <div>
                  <div style={{ fontWeight: 600, color: formData.environment === 'production' ? 'white' : 'var(--text-primary)' }}>Production</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Strict serial queue, health checks</div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label className="form-label">Deployment Policy</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <label 
                style={{
                  flex: 1,
                  padding: '16px',
                  border: `2px solid ${formData.policy === 'replace' ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: formData.policy === 'replace' ? 'var(--primary-light)' : 'transparent',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="policy"
                  value="replace"
                  checked={formData.policy === 'replace'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                  disabled={loading}
                />
                <div>
                  <div style={{ fontWeight: 600, color: formData.policy === 'replace' ? 'white' : 'var(--text-primary)' }}>Replace</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Swaps instances all at once</div>
                </div>
              </label>

              <label 
                style={{
                  flex: 1,
                  padding: '16px',
                  border: `2px solid ${formData.policy === 'canary' ? 'var(--warning)' : 'var(--border-color)'}`,
                  backgroundColor: formData.policy === 'canary' ? 'var(--warning-bg)' : 'transparent',
                  borderRadius: 'var(--border-radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="policy"
                  value="canary"
                  checked={formData.policy === 'canary'}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--warning)', width: '18px', height: '18px' }}
                  disabled={loading}
                />
                <div>
                  <div style={{ fontWeight: 600, color: formData.policy === 'canary' ? 'white' : 'var(--text-primary)' }}>Canary</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gradual rollout (e.g. 10%, 50%, 100%)</div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Environment Variables (Optional)</label>
              <button 
                type="button"
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setFormData(prev => ({ ...prev, envVars: [...(prev.envVars || []), { key: '', value: '' }] }))}
              >
                + Add Variable
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', marginBottom: '16px' }}>
              Inject runtime configuration into your containers.
            </p>
            
            {(formData.envVars || []).map((env, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="KEY (e.g. DB_HOST)"
                  value={env.key}
                  onChange={(e) => {
                    const newVars = [...formData.envVars];
                    newVars[index].key = e.target.value;
                    setFormData(prev => ({ ...prev, envVars: newVars }));
                  }}
                  disabled={loading}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="VALUE"
                  value={env.value}
                  onChange={(e) => {
                    const newVars = [...formData.envVars];
                    newVars[index].value = e.target.value;
                    setFormData(prev => ({ ...prev, envVars: newVars }));
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                  onClick={() => {
                    const newVars = [...formData.envVars];
                    newVars.splice(index, 1);
                    setFormData(prev => ({ ...prev, envVars: newVars }));
                  }}
                  disabled={loading}
                >
                  <XCircle size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '160px' }}
            >
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <Rocket size={16} />
                  Request Deployment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeployment;
