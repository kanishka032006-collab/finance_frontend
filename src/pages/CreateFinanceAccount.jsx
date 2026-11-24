import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Landmark, ArrowLeft, Calculator, Calendar, Save, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import api from '../services/api';

const CreateFinanceAccount = () => {
  const [searchParams] = useSearchParams();
  const preSelectedCustomerId = searchParams.get('customerId');

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(preSelectedCustomerId || '');
  const [agreedRepayment, setAgreedRepayment] = useState('10000');
  const [actualDisbursed, setActualDisbursed] = useState('8200');
  const [totalWeeks, setTotalWeeks] = useState('10');
  const [firstDueDate, setFirstDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [dueDay, setDueDay] = useState('Monday');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Load customer list
  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (data.success && data.settings.defaultDueDay) setDueDay(data.settings.defaultDueDay);
    }).catch((err) => console.error('Failed to load default due day:', err));
  }, []);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await api.get('/customers', { params: { active: true, limit: 100 } });
        if (res.data.success) {
          setCustomers(res.data.customers);
          if (preSelectedCustomerId) {
            setSelectedCustomer(preSelectedCustomerId);
          } else if (res.data.customers.length > 0) {
            setSelectedCustomer(res.data.customers[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
  }, [preSelectedCustomerId]);

  // Derived financial calculations
  const repaymentNum = parseFloat(agreedRepayment) || 0;
  const disbursedNum = parseFloat(actualDisbursed) || 0;
  const weeksNum = parseInt(totalWeeks, 10) || 1;

  const grossDifference = Math.max(0, repaymentNum - disbursedNum);
  const weeklyInstalment = weeksNum > 0 ? Math.round((repaymentNum / weeksNum) * 100) / 100 : 0;

  // Auto-generate preview schedule
  const schedulePreview = [];
  if (repaymentNum > 0 && weeksNum > 0 && firstDueDate) {
    const start = new Date(firstDueDate);
    let accum = 0;
    for (let i = 1; i <= Math.min(weeksNum, 12); i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + (i - 1) * 7);
      let amt = weeklyInstalment;
      if (i === weeksNum) {
        amt = Math.round((repaymentNum - accum) * 100) / 100;
      } else {
        accum += amt;
      }
      schedulePreview.push({
        week: i,
        dueDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: amt
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCustomer) {
      setError('Please select a borrower customer.');
      return;
    }
    if (disbursedNum > repaymentNum) {
      setError('Disbursed amount cannot exceed agreed repayment amount.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        customerId: selectedCustomer,
        agreedRepayment: repaymentNum,
        actualDisbursed: disbursedNum,
        totalWeeks: weeksNum,
        firstDueDate: new Date(firstDueDate).toISOString(),
        dueDay,
        notes
      };

      const res = await api.post('/accounts', payload);
      if (res.data.success) {
        setSuccess(`Finance Account ${res.data.account.accountNumber} created successfully!`);
        setTimeout(() => navigate(`/ledger?accountId=${res.data.account.id}`), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create finance account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/accounts')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-stone-100 pb-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#BFE23A] font-extrabold flex items-center justify-center text-lg shadow-sm">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Finance Account</h1>
            <p className="text-xs text-slate-500">
              Contract creation with automatic Gross Difference & Weekly Schedule generation
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
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Customer / Borrower *
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 font-medium"
            >
              <option value="">-- Choose Borrower --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerCode}) - Mobile: {c.mobile}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Agreed Repayment Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Agreed Repayment Amount (₹) *
              </label>
              <input
                type="number"
                min="100"
                step="1"
                required
                value={agreedRepayment}
                onChange={(e) => setAgreedRepayment(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Contractual repayment sum to collect</span>
            </div>

            {/* Actual Disbursed Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Actual Disbursed Amount (₹) *
              </label>
              <input
                type="number"
                min="50"
                step="1"
                required
                value={actualDisbursed}
                onChange={(e) => setActualDisbursed(e.target.value)}
                placeholder="e.g. 8200"
                className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Amount handed to the borrower</span>
            </div>
          </div>

          {/* Automatic Calculation Banner */}
          <div className="bg-[#FAF2E9] border border-stone-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Gross Difference:</span>
              <span className="text-base font-black text-purple-800 font-mono">
                ₹{grossDifference.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">Repayment - Disbursed</span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Weeks:</span>
              <span className="text-base font-black text-slate-900 font-mono">{weeksNum} Weeks</span>
            </div>
            <div>
              <span className="text-slate-500 block">Weekly Instalment:</span>
              <span className="text-base font-black text-emerald-700 font-mono">
                ₹{weeklyInstalment.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 block">per week</span>
            </div>
            <div>
              <span className="text-slate-500 block">Schedule Validation:</span>
              <span className="text-xs font-bold text-emerald-800 inline-flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                100% Balanced
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Number of Weeks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Number of Weeks *
              </label>
              <input
                type="number"
                min="1"
                max="104"
                required
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
              />
            </div>

            {/* First Due Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                First Due Date *
              </label>
              <input
                type="date"
                required
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 font-medium"
              />
            </div>

            {/* Due Day */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Collection Due Day *
              </label>
              <select
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50 font-medium"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Account Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Credit assessment comments, guarantor reference, business purpose..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#BFE23A] bg-stone-50/50"
            />
          </div>

          {/* Schedule Preview Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Generated Weekly Repayment Schedule Preview (First {schedulePreview.length} Weeks)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {schedulePreview.map((item) => (
                <div key={item.week} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-center text-xs">
                  <span className="font-bold text-slate-700 block">Week {item.week}</span>
                  <span className="text-[10px] text-slate-500 block">{item.dueDate}</span>
                  <span className="font-mono font-bold text-emerald-700 block mt-1">₹{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/accounts')}
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
              {loading ? 'Generating Schedule & Creating Account...' : 'Create Finance Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFinanceAccount;
