import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api from '../services/api';
import PrintPDFButton from '../components/common/PrintPDFButton';

const CashFlow = () => {
  const [cashFlow, setCashFlow] = useState({ series: [], summary: {} });
  const [pnl, setPnl] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cfRes, pnlRes] = await Promise.all([
          api.get('/reports/cashflow', { params: { days: 14 } }),
          api.get('/reports/pnl'),
        ]);
        if (cfRes.data.success) setCashFlow(cfRes.data.data);
        if (pnlRes.data.success) setPnl(pnlRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cash flow analytics.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const s = cashFlow.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ArrowRightLeft className="w-6 h-6 text-slate-800" /> Cash Flow & Profit / Loss
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            14-day cash vs online movement, realized gross margin & net profit overview
          </p>
        </div>
        <PrintPDFButton />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-[#E10600]">
          <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Cash Flow Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cash Balance (14d)</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{Number(s.cashBalance || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Online / UPI Balance (14d)</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{Number(s.onlineBalance || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Cash Movement (14d)</p>
          <p className={`text-2xl font-black mt-1 ${Number(s.netCashMovement || 0) >= 0 ? 'text-emerald-700' : 'text-[#E10600]'}`}>
            ₹{Number(s.netCashMovement || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Profit (Realized)</p>
          <p className={`text-2xl font-black mt-1 ${Number(pnl.netProfit || 0) >= 0 ? 'text-emerald-700' : 'text-[#E10600]'}`}>
            ₹{Number(pnl.netProfit || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Recharts BarChart */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
        <h2 className="text-base font-black text-slate-900 mb-4">Daily Collections vs Expenses (Last 14 Days)</h2>
        {loading ? (
          <div className="h-72 flex items-center justify-center text-sm text-slate-400">Loading chart...</div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow.series || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="collections" name="Collections (₹)" fill="#789486" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses (₹)" fill="#E10600" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* P&L Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
        <h2 className="text-base font-black text-slate-900 mb-4">Profit & Loss Statement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <p className="text-xs text-slate-500 font-semibold">Expected Gross Profit</p>
            <p className="text-lg font-black text-slate-900 mt-1">₹{Number(pnl.expectedGrossProfit || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <p className="text-xs text-slate-500 font-semibold">Realized Gross Profit</p>
            <p className="text-lg font-black text-emerald-700 mt-1">₹{Number(pnl.realizedGrossProfit || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <p className="text-xs text-slate-500 font-semibold">Total Operational Expenses</p>
            <p className="text-lg font-black text-[#E10600] mt-1">₹{Number(pnl.totalExpenses || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <p className="text-xs text-slate-500 font-semibold">Total Staff Salaries</p>
            <p className="text-lg font-black text-[#E10600] mt-1">₹{Number(pnl.totalSalaries || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <p className="text-xs text-slate-500 font-semibold">Total Capital Invested</p>
            <p className="text-lg font-black text-slate-900 mt-1">₹{Number(s.totalInvestments || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 text-white">
            <p className="text-xs text-slate-300 font-semibold">Net Profit</p>
            <p className="text-lg font-black text-[#789486] mt-1">₹{Number(pnl.netProfit || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
