import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PrintPDFButton from '../components/common/PrintPDFButton';

const CATEGORIES = ['Office Rent', 'Staff Travel & Fuel', 'Printing & Stationery', 'Electricity & Internet', 'Misc Operational', 'Legal & Recovery'];

const Expenses = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMINISTRATOR';

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, byCategory: [], count: 0 });
  const [filterCategory, setFilterCategory] = useState('');

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('CASH');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = filterCategory ? { category: filterCategory } : {};
      const [expRes, sumRes] = await Promise.all([
        api.get('/expenses', { params }),
        api.get('/expenses/summary', { params }),
      ]);
      if (expRes.data.success) setExpenses(expRes.data.data);
      if (sumRes.data.success) setSummary(sumRes.data.data);
    } catch (err) {
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/expenses', { category, amount, date, method, description });
      if (res.data.success) {
        setAmount('');
        setDescription('');
        setSuccess('Expense recorded successfully.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expense.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete expense.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-slate-800" /> Expense Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track operational expenses, field travel costs & branch overheads
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</p>
          <p className="text-2xl font-black text-[#E10600] mt-1">₹{Number(summary.totalAmount || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expense Entries</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.count || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories Tracked</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.byCategory?.length || 0}</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card space-y-4">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Record New Expense
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
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
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Description / Voucher notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#789486] text-white font-bold text-xs hover:brightness-95 transition"
          >
            Add Expense
          </button>
        </div>
      </form>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Expense Ledger</h2>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-stone-300"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-stone-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-right">Amount</th>
                {isAdmin && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-400">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-slate-400">No expenses recorded yet.</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4 text-slate-600">{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{exp.category}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-slate-600">{exp.method}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.description || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{exp.createdBy?.name}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#E10600]">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(exp.id)}
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

export default Expenses;
