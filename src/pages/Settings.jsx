import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  Receipt,
  CheckCircle,
  Database,
  Lock
} from 'lucide-react';
import api, { downloadAuthenticatedFile } from '../services/api';

const Settings = () => {
  const getErrorMessage = async (err, fallback) => {
    const data = err.response?.data;
    if (data instanceof Blob) {
      try {
        const parsed = JSON.parse(await data.text());
        if (parsed.message) return parsed.message;
      } catch (_) {
        // Fall back to the transport error if the response was not JSON.
      }
    }
    return data?.message || err.message || fallback;
  };

  const [settings, setSettings] = useState({
    companyName: 'Tridin Software',
    currencySymbol: '₹',
    receiptPrefix: 'REC-YYYYMM-XXXX',
    defaultDueDay: 'Monday',
    enabledPaymentMethods: ['CASH', 'UPI', 'BANK_TRANSFER'],
    allowOverdueGraceDays: 0,
    backupAutoSchedule: 'Daily'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data.success) {
          setSettings((current) => ({ ...current, ...res.data.settings }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setMessageError(false);

    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        setMessage('Settings saved successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(await getErrorMessage(err, 'Failed to save settings.'));
      setMessageError(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentMethodToggle = (method) => {
    const current = [...settings.enabledPaymentMethods];
    if (current.includes(method)) {
      if (current.length === 1) {
        alert('At least one payment method must remain active.');
        return;
      }
      setSettings({
        ...settings,
        enabledPaymentMethods: current.filter((m) => m !== method)
      });
    } else {
      setSettings({
        ...settings,
        enabledPaymentMethods: [...current, method]
      });
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setMessage('');
    setMessageError(false);
    try {
      await downloadAuthenticatedFile('/settings/backup', {}, 'Complete_System_Database_Snapshot.pdf');
    } catch (err) {
      setMessage(await getErrorMessage(err, 'Failed to generate database snapshot.'));
      setMessageError(true);
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Preferences</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Operational Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure institutional branding, collection defaults & database disaster recovery</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 border rounded-2xl text-xs font-bold flex items-center gap-2 ${messageError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          <CheckCircle className={`w-4 h-4 ${messageError ? 'text-red-600' : 'text-emerald-600'}`} />
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Institutional Branding */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Building2 className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Institutional Branding & Currency</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Entity Name</label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Collection & Receipt Rules */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Receipt className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Receipts & Due Day Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Receipt Prefix</label>
              <input
                type="text"
                required
                value={settings.receiptPrefix}
                onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300 bg-stone-50/50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Output: REC-YYYYMM-XXXX</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Default Due Day</label>
              <select
                value={settings.defaultDueDay}
                onChange={(e) => setSettings({ ...settings, defaultDueDay: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50/50 font-medium"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Overdue Grace Days</label>
              <input
                type="number"
                min="0"
                max="14"
                value={settings.allowOverdueGraceDays}
                onChange={(e) => setSettings({ ...settings, allowOverdueGraceDays: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-stone-300 bg-stone-50/50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Days after due before overdue tag</span>
            </div>
          </div>

          {/* Payment Method Toggles */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Allowed Payment Methods
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['CASH', 'UPI', 'BANK_TRANSFER'].map((method) => {
                const isEnabled = settings.enabledPaymentMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handlePaymentMethodToggle(method)}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isEnabled
                        ? 'bg-[#BFE23A]/20 border-[#BFE23A] text-slate-900'
                        : 'bg-stone-50 border-stone-200 text-slate-400 line-through'
                    }`}
                  >
                    <span>{method}</span>
                    <span className="text-[10px] font-mono">{isEnabled ? 'ACTIVE' : 'OFF'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-[#BFE23A] hover:bg-[#aed12b] text-slate-950 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Database Backup Management */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Database className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Database Disaster Recovery & Backup</h3>
        </div>

        <p className="text-xs text-slate-500">
          Generate an immediate, comprehensive encrypted JSON backup snapshot of all borrowers, finance accounts,
          instalments, payments, and audit ledgers directly from PostgreSQL.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={backupLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition"
          >
            <Download className="w-4 h-4 text-[#BFE23A]" />
            {backupLoading ? 'Generating PDF...' : 'Download Complete System Database Snapshot'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
