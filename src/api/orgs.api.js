import api from './axios.js';

export const listOrgs = () => api.get('/orgs').then((r) => r.data.data);

export const createOrg = (data) => api.post('/orgs', data).then((r) => r.data.data);

export const updateOrg = (id, data) => api.patch(`/orgs/${id}`, data).then((r) => r.data.data);

export const deleteOrg = (id) => api.delete(`/orgs/${id}`).then((r) => r.data.data);
