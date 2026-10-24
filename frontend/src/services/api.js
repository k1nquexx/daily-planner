const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('dayflow_token');
export const setAuthToken = (token) => localStorage.setItem('dayflow_token', token);
export const clearAuthToken = () => localStorage.removeItem('dayflow_token');

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Auth expired
    if (!endpoint.includes('/auth/')) {
      clearAuthToken();
      window.dispatchEvent(new Event('dayflow_unauthorized'));
    }
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка запроса');
    }
    return data;
  }

  if (!response.ok) {
    throw new Error('Ошибка сервера');
  }

  return response.text();
}

export const api = {
  // Auth
  login: (pin) => request('/auth/login', { method: 'POST', body: JSON.stringify({ pin }) }),
  verifyAuth: () => request('/auth/verify'),
  updatePin: (currentPin, newPin) =>
    request('/auth/update-pin', { method: 'POST', body: JSON.stringify({ currentPin, newPin }) }),

  // Tasks
  getTasks: (dateStr) => request(`/tasks?date=${dateStr}`),
  createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  toggleSubtask: (taskId, subtaskId) =>
    request(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  rolloverTasks: (from, to) =>
    request(`/tasks/rollover?from=${from}&to=${to}`, { method: 'POST' }),

  // Reviews
  getReview: (dateStr) => request(`/reviews/${dateStr}`),
  saveReview: (review) => request('/reviews', { method: 'POST', body: JSON.stringify(review) }),
  getDailySummary: (dateStr) => request(`/reviews/${dateStr}/summary`),

  // Network info for phone QR
  getNetworkInfo: () => request('/network-info'),
};
