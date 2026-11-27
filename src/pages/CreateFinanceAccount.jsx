import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Landmark, ArrowLeft, Calendar, Save, ShieldAlert, CheckCircle } from 'lucide-react';
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
  const [loanType, setLoanType] = useState('WEEKLY_COLLECTION');
  const [interestRate, setInterestRate] = useState('');
  const [collectionFrequency, setCollectionFrequency] = useState('WEEKLY');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/settings')
      .then(({ data }) => {
        if (data.success && data.settings.defaultDueDay) setDueDay(data.settings.defaultDueDay);
      })
      .catch((err) => console.error('Failed to load default due day:', err));
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

  const repaymentNum = parseFloat(agreedRepayment) || 0;
  const disbursedNum = parseFloat(actualDisbursed) || 0;
  const weeksNum = parseInt(totalWeeks, 10) || 1;

  const grossDifference = Math.max(0, repaymentNum - disbursedNum);
  const weeklyInstalment = weeksNum > 0 ? Math.round((repaymentNum / weeksNum) * 100) / 100 : 0;

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
        amount: amt,
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
        notes,
        loanType,
        interestRate: interestRate ? parseFloat(interestRate) : null,
        collectionFrequency,
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/accounts')}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold text-[#718096] hover:text-[#2446A8] hover:bg-white border border-transparent hover:border-[#E2E8F4] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F4] shadow-card p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2446A8] via-[#A58BEA] to-[#13A89E]" />
        <div className="flex items-center gap-3 border-b border-[#E2E8F4] pb-4 sm:pb-5 mb-5 sm:mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2446A8] to-[#13A89E] text-white font-extrabold flex items-center justify-center shadow-sm shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black text-[#17233C] tracking-tight">
              Create Finance Account
            </h1>
            <p className="text-xs text-[#718096]">
              Contract creation with automatic Gross Difference & Weekly Schedule generation
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
          <div>
            <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
              Select Customer / Borrower *
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
            >
              <option value="">-- Choose Borrower --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerCode}) - {c.mobile}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Loan Type *
              </label>
              <select
                value={loanType}
                onChange={(e) => {
                  const val = e.target.value;
                  setLoanType(val);
                  if (val === 'DAILY_COLLECTION') setCollectionFrequency('DAILY');
                  else if (val === 'MONTHLY_COLLECTION' || val === 'MONTHLY_INTEREST')
                    setCollectionFrequency('MONTHLY');
                  else setCollectionFrequency('WEEKLY');
                }}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
              >
                <option value="WEEKLY_COLLECTION">Weekly Collection Loan</option>
                <option value="DAILY_COLLECTION">Daily Collection Loan</option>
                <option value="MONTHLY_COLLECTION">Monthly Collection Loan</option>
                <option value="MONTHLY_INTEREST">Monthly Interest Loan</option>
                <option value="GOLD_LOAN">Gold Loan</option>
                <option value="AUTO_FINANCE">Auto Finance Loan</option>
                <option value="ENTERPRISE">Enterprise Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Repayment Frequency *
              </label>
              <select
                value={collectionFrequency}
                onChange={(e) => setCollectionFrequency(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Interest Rate (% Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-num font-bold rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
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
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-num font-bold rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
              <span className="text-[11px] text-[#718096] mt-1 block">Contractual repayment sum to collect</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
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
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-num font-bold rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
              <span className="text-[11px] text-[#718096] mt-1 block">Amount handed to the borrower</span>
            </div>
          </div>

          {/* Automatic Calculation Banner */}
          <div className="bg-[#F5F7FC] border border-[#E2E8F4] rounded-2xl p-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div>
              <span className="text-[#718096] block">Gross Difference:</span>
              <span className="text-base font-extrabold text-[#6E4BC4] font-num">
                ₹{grossDifference.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#718096] block">Repayment - Disbursed</span>
            </div>
            <div>
              <span className="text-[#718096] block">Total Weeks:</span>
              <span className="text-base font-extrabold text-[#17233C] font-num">{weeksNum} Weeks</span>
            </div>
            <div>
              <span className="text-[#718096] block">Weekly Installment</span>
              <span className="text-base font-extrabold text-[#0D857D] font-num">
                ₹{weeklyInstalment.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#718096] block">per week</span>
            </div>
            <div>
              <span className="text-[#718096] block">Schedule Validation:</span>
              <span className="text-xs font-bold text-[#0D857D] inline-flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#13A89E]" />
                100% Balanced
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
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
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm font-num font-bold rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                First Due Date *
              </label>
              <input
                type="date"
                required
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
                Collection Due Day *
              </label>
              <select
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C] font-medium"
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

          <div>
            <label className="block text-xs font-bold text-[#17233C] uppercase tracking-wider mb-1.5">
              Internal Collection Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Credit assessment comments, guarantor reference, business purpose..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#DCE4F2] focus:outline-none focus:ring-2 focus:ring-[#2446A8] bg-[#F5F7FC] text-[#17233C]"
            />
          </div>

          {/* Schedule Preview Section */}
          <div>
            <h4 className="text-xs font-bold text-[#17233C] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2446A8]" />
              <span>Generated Weekly Repayment Schedule Preview (First {schedulePreview.length} Weeks)</span>
            </h4>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {schedulePreview.map((item) => (
                <div
                  key={item.week}
                  className="p-2.5 rounded-xl border border-[#E2E8F4] bg-[#F5F7FC] text-center text-xs"
                >
                  <span className="font-bold text-[#17233C] block">Week {item.week}</span>
                  <span className="text-[10px] text-[#718096] block font-num">{item.dueDate}</span>
                  <span className="font-num font-extrabold text-[#0D857D] block mt-1">₹{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F4] flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/accounts')}
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
              <span>
                {loading ? 'Generating Schedule & Creating Account...' : 'Create Finance Account'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFinanceAccount;
