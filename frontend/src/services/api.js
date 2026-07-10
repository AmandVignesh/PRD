const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Reusable fetch wrapper to handle JSON serialization, headers, and standard error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    // Parse JSON safely
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = (data && data.error) || response.statusText || 'Request failed';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

export const tasksApi = {
  getAll: () => request('/tasks'),
  create: (taskData) => request('/tasks', { method: 'POST', body: taskData }),
  toggle: (id) => request(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  update: (id, taskData) => request(`/tasks/${id}`, { method: 'PUT', body: taskData }),
  delete: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};

export const goalsApi = {
  getAll: () => request('/goals'),
  create: (goalData) => request('/goals', { method: 'POST', body: goalData }),
  update: (id, goalData) => request(`/goals/${id}`, { method: 'PUT', body: goalData }),
  delete: (id) => request(`/goals/${id}`, { method: 'DELETE' }),
};
