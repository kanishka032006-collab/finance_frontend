import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Trash2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PrintPDFButton from '../components/common/PrintPDFButton';

const Investments = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMINISTRATOR';

  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, count: 0 });
  const [investorName, setInvestorName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, sumRes] = await Promise.all([
        api.get('/investments'),
        api.get('/investments/summary'),
      ]);
      if (invRes.data.success) setInvestments(invRes.data.data);
      if (sumRes.data.success) setSummary(sumRes.data.data);
    } catch (err) {
      setError('Failed to load investments.');
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
      const res = await api.post('/investments', { investorName, amount, date, description });
      if (res.data.success) {
        setInvestorName('');
        setAmount('');
        setDescription('');
        setSuccess('Capital investment recorded.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record investment.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/investments/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete investment.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-slate-800" /> Investment Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track partner capital infusions, investor contributions & lending pool
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invested Capital</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">₹{Number(summary.totalAmount || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Investment Entries</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.count || 0}</p>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card space-y-4">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Record Capital Investment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Investor / Partner Name"
              value={investorName}
              onChange={(e) => setInvestorName(e.target.value)}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Remarks / Reference..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#789486] text-white font-bold text-xs hover:brightness-95 transition"
            >
              Add Investment
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-stone-100">
          <h2 className="text-base font-black text-slate-900">Investment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-stone-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Investor Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4 text-right">Amount</th>
                {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">Loading investments...</td></tr>
              ) : investments.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">No investments recorded yet.</td></tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4 text-slate-600">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{inv.investorName}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.description || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{inv.createdBy?.name}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">₹{Number(inv.amount).toLocaleString('en-IN')}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(inv.id)}
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

export default Investments;
