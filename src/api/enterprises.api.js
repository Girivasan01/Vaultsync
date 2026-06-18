import api from './axios.js';

export const listEnterprises = (orgId) =>
  api.get('/enterprises', { params: orgId ? { orgId } : {} }).then((r) => r.data.data);

export const createEnterprise = (data) =>
  api.post('/enterprises', data).then((r) => r.data.data);

export const updateSubscription = (id, isActive, expiry_date) =>
  api.patch(`/enterprises/${id}/subscription`, {
    isActive,
    ...(expiry_date !== undefined ? { expiry_date } : {})
  }).then((r) => r.data.data);

export const syncHotelEnterprise = (id) =>
  api.post(`/enterprises/${id}/sync-hotel`).then((r) => r.data);

export const deleteEnterprise = (id) =>
  api.delete(`/enterprises/${id}`).then((r) => r.data.data);

export const listEnterpriseUsers = (enterpriseId) =>
  api.get(`/enterprises/${enterpriseId}/users`).then((r) => r.data.data);

export const createEnterpriseUser = (enterpriseId, data) =>
  api.post(`/enterprises/${enterpriseId}/users`, data).then((r) => r.data.data);

export const updateEnterpriseUser = (enterpriseId, userId, data) =>
  api.patch(`/enterprises/${enterpriseId}/users/${userId}`, data).then((r) => r.data.data);

export const deleteEnterpriseUser = (enterpriseId, userId) =>
  api.delete(`/enterprises/${enterpriseId}/users/${userId}`).then((r) => r.data.data);