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
    assignedCollectorId: ''
  });
  const [collectors, setCollectors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      api.get('/users').then(({ data }) => {
        setCollectors((data.users || []).filter((member) => member.role === 'COLLECTION_STAFF' && member.active));
      }).catch((err) => console.error('Failed to load collection staff:', err));
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
              assignedCollectorId: c.assignedCollectorId || ''
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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#BFE23A] font-extrabold flex items-center justify-center text-lg shadow-sm">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {editId ? 'Update Customer Profile' : 'Register New Borrower'}
            </h1>
            <p className="text-xs text-slate-500">
              {editId ? 'Modify registered customer KYC and contact details' : 'Enroll client into Tridin Finance collection system'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-[#E10600]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Customer Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Patel"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <input
                type="text"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="e.g. +91 98234 56789"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Permanent / Business Address *
            </label>
            <textarea
              name="address"
              required
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Shop No. 12, Market Yard, Pune, Maharashtra 411037"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* KYC Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                KYC Verification Status
              </label>
              <select
                name="kycStatus"
                value={formData.kycStatus}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 text-slate-700 font-medium"
              >
                <option value="PENDING">Pending Verification</option>
                <option value="VERIFIED">Verified (Aadhaar / PAN checked)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              />
            </div>
          </div>

          {/* Internal Notes */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Collection Officer
              </label>
              <select
                name="assignedCollectorId"
                value={formData.assignedCollectorId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              >
                <option value="">Unassigned</option>
                {collectors.map((collector) => (
                  <option key={collector.id} value={collector.id}>{collector.name} ({collector.email})</option>
                ))}
              </select>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Collection Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Mention business type, daily shop timings, collection preferences, or guarantor details..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-slate-600 hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : editId ? 'Save Changes' : 'Register Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
