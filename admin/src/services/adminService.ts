import api from './api';

export const adminService = {
  async login(userId: string, password: string) {
    const res = await api.post('/auth/admin/login', { userId, password });
    if (res?.data?.accessToken) {
      localStorage.setItem('gigsevak_token', res.data.accessToken);
      sessionStorage.setItem('gigsevak_token', res.data.accessToken);
      localStorage.setItem('gigsevak_admin_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res;
  },

  async getWorkers(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/admin/workers${query ? `?${query}` : ''}`);
    return res;
  },

  async getWorkerDetails(workerId: string) {
    const res = await api.get(`/admin/workers/${workerId}`);
    return res?.data?.worker || res?.data || res?.worker || res;
  },

  async updateWorkerKyc(workerId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) {
    const res = await api.put(`/admin/workers/${workerId}/kyc`, {
      status,
      notes,
      rejectionReason: notes
    });
    return res?.data || res;
  },

  async getUsers() {
    const res = await api.get('/admin/users');
    return res?.data || res;
  },

  async updateUserStatus(userId: string, isBlocked: boolean, blockReason?: string) {
    const res = await api.put(`/admin/users/${userId}/status`, { isBlocked, blockReason });
    return res?.data || res;
  },

  async getBookings() {
    const res = await api.get('/admin/bookings');
    return res?.data || res;
  },

  async getDisputes() {
    const res = await api.get('/complaints');
    return res?.data || res;
  },

  async resolveDispute(complaintId: string, action: string, refundAmount?: number, comments?: string) {
    const res = await api.put(`/complaints/${complaintId}/resolve`, {
      action,
      refundAmount,
      comments
    });
    return res.data;
  }
};

export default adminService;