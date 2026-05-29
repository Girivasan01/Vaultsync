import api from './axios.js';

export async function listBackups(params = {}) {
  const response = await api.get('/backups', { params });
  return response.data.data;
}

export async function manualBackup(appId) {
  const response = await api.post(`/backups/manual/${appId}`);
  return response.data.data;
}

export async function deleteBackup(id) {
  const response = await api.delete(`/backups/${id}`);
  return response.data;
}

export async function getDownloadLink(id) {
  const response = await api.get(`/backups/${id}/download`);
  return response.data.data;
}
