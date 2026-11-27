import React, { useState, useEffect } from 'react';
import { Banknote, Plus, Trash2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PrintPDFButton from '../components/common/PrintPDFButton';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StaffSalary = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMINISTRATOR';

  const [salaries, setSalaries] = useState([]);
  const [staff, setStaff] = useState([]);
  const [summary, setSummary] = useState({ totalPaid: 0, count: 0 });

  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salRes, sumRes, usersRes] = await Promise.all([
        api.get('/salary'),
        api.get('/salary/summary'),
        api.get('/users'),
      ]);
      if (salRes.data.success) setSalaries(salRes.data.data);
      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (usersRes.data.success) {
        const list = usersRes.data.users || [];
        setStaff(list);
        if (!userId && list.length > 0) setUserId(list[0].id);
      }
    } catch (err) {
      setError('Failed to load staff salary records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/salary', { userId, amount, month, year, notes });
      if (res.data.success) {
        setAmount('');
        setNotes('');
        setSuccess('Salary payment recorded.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record salary payment.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/salary/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete salary record.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Banknote className="w-6 h-6 text-slate-800" /> Staff Salary Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record monthly staff salaries, incentives & payroll disbursements
          </p>
        </div>
        <PrintPDFButton />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#E10600]">
          <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Salaries Paid</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{Number(summary.totalPaid || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payroll Entries</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.count || 0}</p>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Record Salary Disbursement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            >
              {staff.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.replace('_', ' ')})</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="Salary Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            >
              {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
            </select>
            <input
              type="number"
              min="2020"
              max="2099"
              required
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Notes / Incentive details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#789486] text-white font-bold text-xs hover:brightness-95 transition"
            >
              Record Salary
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-stone-100">
          <h2 className="text-base font-black text-slate-900">Salary Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-stone-200">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Paid Date</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
                {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">Loading salary records...</td></tr>
              ) : salaries.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">No salary records yet.</td></tr>
              ) : (
                salaries.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.user?.name}</td>
                    <td className="py-3 px-4 text-slate-700">{MONTHS[(s.month || 1) - 1]} {s.year}</td>
                    <td className="py-3 px-4 text-slate-600">{s.paidAt ? new Date(s.paidAt).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{s.notes || '—'}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">₹{Number(s.amount).toLocaleString('en-IN')}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#E10600] hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffSalary;
