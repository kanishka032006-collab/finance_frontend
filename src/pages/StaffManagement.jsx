import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit,
  UserX,
  Mail,
  Phone,
  KeyRound
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'COLLECTION_STAFF',
    phone: '',
    active: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { isAdmin, user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'COLLECTION_STAFF',
      phone: '',
      active: true
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      phone: u.phone || '',
      active: u.active
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingUser) {
        const res = await api.put(`/users/${editingUser.id}`, formData);
        if (res.data.success) {
          setModalOpen(false);
          fetchUsers();
        }
      } else {
        const res = await api.post('/users', formData);
        if (res.data.success) {
          setModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (u) => {
    if (u.id === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to toggle status for ${u.name}?`)) {
      return;
    }
    try {
      await api.put(`/users/${u.id}`, { active: !u.active });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Access Control</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff & Role Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage collection officers, auditor access & role-based permissions</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Role Definitions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-purple-700">Administrator</span>
            <StatusBadge status="ADMINISTRATOR" />
          </div>
          <p className="text-xs text-slate-500">
            Full root privileges: add/edit customers, create loans, reverse transactions, manage staff, export backups and configure system.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-sky-700">Collection Staff</span>
            <StatusBadge status="COLLECTION_STAFF" />
          </div>
          <p className="text-xs text-slate-500">
            Field and branch operations: view portfolios, register borrowers, create finance accounts, record collections and print customer receipts.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-700">Read-only Auditor</span>
            <StatusBadge status="READ_ONLY_AUDITOR" />
          </div>
          <p className="text-xs text-slate-500">
            Compliance oversight: inspect customer ledgers, review transactions, verify audit trails and generate analytical balance reports.
          </p>
        </div>
      </div>

      {/* Staff Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF2E9]/70 border-b border-stone-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Collections Logged</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading staff directory...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs">
                          {u.name ? u.name[0] : 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {u._count?.paymentsCollected || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isAdmin && (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-stone-100"
                            title="Edit Role or Credentials"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeactivate(u)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title={u.active ? 'Deactivate Account' : 'Reactivate Account'}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit Staff: ${editingUser.name}` : 'Register New Staff Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-[#E10600] rounded-xl text-xs font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              disabled={!!editingUser}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {editingUser ? 'New Password (leave empty to keep current)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 font-bold"
              >
                <option value="COLLECTION_STAFF">Collection Staff</option>
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="READ_ONLY_AUDITOR">Read-only Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                placeholder="+91 98765 00000"
              />
            </div>
          </div>

          {editingUser && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="activeToggle"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-stone-300 text-[#BFE23A] focus:ring-[#BFE23A]"
              />
              <label htmlFor="activeToggle" className="text-xs font-bold text-slate-700">
                Active Account Enabled
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-xs font-bold bg-[#BFE23A] text-slate-950 rounded-xl hover:bg-[#aed12b]"
            >
              {formLoading ? 'Saving...' : editingUser ? 'Update Staff Member' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
