import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddCustomer = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    kycStatus: 'PENDING',
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    assignedCollectorId: '',
  });
  const [collectors, setCollectors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      api
        .get('/users')
        .then(({ data }) => {
          setCollectors(
            (data.users || []).filter((member) => member.role === 'COLLECTION_STAFF' && member.active)
          );
        })
        .catch((err) => console.error('Failed to load collection staff:', err));
    }
    if (editId) {
      const loadCustomer = async () => {
        try {
          const res = await api.get(`/customers/${editId}`);
          if (res.data.success) {
            const c = res.data.customer;
            setFormData({
              name: c.name || '',
              mobile: c.mobile || '',
              address: c.address || '',
              kycStatus: c.kycStatus || 'PENDING',
              startDate: c.startDate ? c.startDate.split('T')[0] : '',
              notes: c.notes || '',
              assignedCollectorId: c.assignedCollectorId || '',
            });
          }
        } catch (err) {
          setError('Failed to load customer for editing.');
        }
      };
      loadCustomer();
    }
  }, [editId, isAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (editId) {
        const res = await api.put(`/customers/${editId}`, formData);
        if (res.data.success) {
          setSuccess('Customer updated successfully!');
          setTimeout(() => navigate(`/customers/${editId}`), 1200);
        }
      } else {
        const res = await api.post('/customers', formData);
        if (res.data.success) {
          setSuccess('Customer registered successfully!');
          setTimeout(() => navigate(`/customers/${res.data.customer.id}`), 1200);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold text-[#718096] hover:text-[#2446A8] hover:bg-white border border-transparent hover:border-[#E2E8F4] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2446A8] to-[#13A89E]" />
        <div className="flex items-center gap-3 border-b border-[#E2E8F4] pb-4 sm:pb-5 mb-5 sm:mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2446A8] to-[#13A89E] text-white font-extrabold flex items-center justify-center shadow-sm shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-[#17233C] tracking-tight">
              {editId ? 'Update Customer Profile' : 'Register New Borrower'}
            </h1>
            <p className="text-xs text-[#718096]">
              {editId
                ? 'Modify registered customer KYC and contact details'
                : 'Enroll client into Tridin Finance collection system'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#FDF0F1] border border-[#E45B68]/35 flex items-start gap-2.5 text-xs text-[#C93D4B]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#E6F8F7] border border-[#13A89E]/35 flex items-start gap-2.5 text-xs text-[#0D857D] font-semibold">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#13A89E]" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Full Customer Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Patel"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <input
                type="text"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. +91 98234 56789"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-num rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
              Permanent / Business Address *
            </label>
            <textarea
              name="address"
              required
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Shop No. 12, Market Yard, Pune, Maharashtra 411037"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                KYC Verification Status
              </label>
              <select
                name="kycStatus"
                value={formData.kycStatus}
                onChange={handleChange}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
              >
                <option value="PENDING">Pending Verification</option>
                <option value="VERIFIED">Verified (Aadhaar / PAN checked)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Account Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Assigned Collection Officer
              </label>
              <select
                name="assignedCollectorId"
                value={formData.assignedCollectorId}
                onChange={handleChange}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              >
                <option value="">Unassigned</option>
                {collectors.map((collector) => (
                  <option key={collector.id} value={collector.id}>
                    {collector.name} ({collector.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
              Internal Collection Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Mention business type, daily shop timings, collection preferences, or guarantor details..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
            />
          </div>

          <div className="pt-4 border-t border-[#E2E8F4] flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#E2E8F4] text-xs font-bold text-[#718096] hover:text-[#17233C] hover:bg-[#F5F7FC] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl text-xs font-extrabold btn-teal disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : editId ? 'Save Changes' : 'Register Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
