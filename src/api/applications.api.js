import api from './axios.js';

export async function listApplications(params = {}) {
  const response = await api.get('/applications', { params });
  return response.data.data;
}

export async function getApplication(id) {
  const response = await api.get(`/applications/${id}`);
  return response.data.data;
}

export async function createApplication(payload) {
  const response = await api.post('/applications', payload);
  return response.data.data;
}

export async function updateApplication(id, payload) {
  const response = await api.patch(`/applications/${id}`, payload);
  return response.data.data;
}

export async function deleteApplication(id) {
  const response = await api.delete(`/applications/${id}`);
  return response.data;
}

export async function testConnection(id) {
  const response = await api.post(`/applications/${id}/test-connection`);
  return response.data.data;
}

export async function backupNow(id) {
  const response = await api.post(`/applications/${id}/backup-now`);
  return response.data.data;
}
