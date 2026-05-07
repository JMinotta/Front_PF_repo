import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get auth headers with dynamic Supabase token
const getAuthHeaders = async (isJson = true) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || 'no-token';
  
  if (token === 'no-token') {
    console.warn('⚠️ API Call: No hay sesión activa de Supabase');
  } else {
    console.log('✅ API Call: Enviando token de Supabase (primeros 10 caracteres):', token.substring(0, 10));
  }

  const headers = {
    'Authorization': `Bearer ${token}`
  };
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
};

export const api = {
  // Get all deployments
  getDeployments: async () => {
    try {
      const res = await fetch(`${BASE_URL}/deployments`, {
        headers: await getAuthHeaders(false)
      });
      if (!res.ok) throw new Error('Failed to fetch deployments');
      const data = await res.json();
      return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Get single deployment by ID
  getDeploymentById: async (id) => {
    try {
      const authHeaders = await getAuthHeaders(false);
      const res = await fetch(`${BASE_URL}/deployments/${id}`, {
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Failed to fetch deployment details');
      const deployment = await res.json();

      // Fetch deployment events
      const eventsRes = await fetch(`${BASE_URL}/deployments/${id}/events`, {
        headers: authHeaders
      });
      let events = [];
      if (eventsRes.ok) {
        events = await eventsRes.json();
      }
      
      return { ...deployment, events };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Create a new deployment
  createDeployment: async (data) => {
    const payload = {
      service_name: data.service_name || data.service,
      image: data.image,
      environment: data.environment,
      policy: data.policy || 'replace',
      health_path: data.health_path || '/',
      container_port: data.container_port || 80,
      env_vars: data.env_vars || null
    };
    
    try {
      const res = await fetch(`${BASE_URL}/deployments`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create deployment');
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Promote a deployment to production
  promoteToProduction: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/deployments/${id}/promote`, {
        method: 'POST',
        headers: await getAuthHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to promote deployment');
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Execute manual rollback
  executeRollback: async (id, reason = "Usuario detectó errores") => {
    try {
      const res = await fetch(`${BASE_URL}/deployments/${id}/rollback`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to execute rollback on backend.');
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Cancel a pending/queued deployment
  cancelDeployment: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/deployments/${id}/cancel`, {
        method: 'POST',
        headers: await getAuthHeaders()
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to cancel deployment');
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Get operational stats for Analytics
  getStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/deployments/stats`, {
        headers: await getAuthHeaders(false)
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};
