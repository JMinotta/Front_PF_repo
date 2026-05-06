const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MOCK_TOKEN = '550e8400-e29b-41d4-a716-446655440000'; // Paper demo stub

export const api = {
  // Get all deployments
  getDeployments: async () => {
    try {
      const res = await fetch(`${BASE_URL}/deployments`, {
        headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` }
      });
      if (!res.ok) throw new Error('Failed to fetch deployments');
      const data = await res.json();
      // Ensure it's sorted by created_at descending if backend didn't sort
      return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Get single deployment by ID
  getDeploymentById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/deployments/${id}`, {
        headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` }
      });
      if (!res.ok) throw new Error('Failed to fetch deployment details');
      const deployment = await res.json();

      // Fetch deployment events
      const eventsRes = await fetch(`${BASE_URL}/deployments/${id}/events`, {
        headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` }
      });
      let events = [];
      if (eventsRes.ok) {
        events = await eventsRes.json();
      }
      
      // Combine them as expected by the frontend
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_TOKEN}`
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_TOKEN}`
        }
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_TOKEN}`
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_TOKEN}`
        }
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
        headers: { 'Authorization': `Bearer ${MOCK_TOKEN}` }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};
