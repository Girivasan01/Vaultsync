import api from './axios.js';

export async function getStats() {
  const response = await api.get('/dashboard/stats');
  return response.data.data;
}

export async function getStorageChart() {
  const response = await api.get('/dashboard/storage-chart');
  return response.data.data;
}

export async function getActivityChart() {
  const response = await api.get('/dashboard/activity-chart');
  return response.data.data;
}

export async function getRecentBackups() {
  const response = await api.get('/dashboard/recent-backups');
  return response.data.data;
}
