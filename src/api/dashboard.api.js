import api from './axios.js';

export async function getStats(params = {}) {
  const response = await api.get('/dashboard/stats', { params });
  return response.data.data;
}

export async function getStorageChart(params = {}) {
  const response = await api.get('/dashboard/storage-chart', { params });
  return response.data.data;
}

export async function getActivityChart(params = {}) {
  const response = await api.get('/dashboard/activity-chart', { params });
  return response.data.data;
}

export async function getRecentBackups(params = {}) {
  const response = await api.get('/dashboard/recent-backups', { params });
  return response.data.data;
}
