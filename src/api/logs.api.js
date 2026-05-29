import api from './axios.js';

export async function listLogs(params = {}) {
  const response = await api.get('/logs', { params });
  return response.data.data;
}
