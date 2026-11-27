import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Users, Calendar, Trash2, UserCheck, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PrintPDFButton from '../components/common/PrintPDFButton';

const RouteManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMINISTRATOR';

  const [areas, setAreas] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [schedule, setSchedule] = useState(null);

  const [areaName, setAreaName] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeCode, setRouteCode] = useState('');
  const [routeAreaId, setRouteAreaId] = useState('');
  const [routeCollectorId, setRouteCollectorId] = useState('');
  const [assignCustomerId, setAssignCustomerId] = useState('');
  const [filterAreaId, setFilterAreaId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [areasRes, routesRes, custRes] = await Promise.all([
        api.get('/routes/areas'),
        api.get('/routes'),
        api.get('/customers', { params: { active: true, limit: 200 } }),
      ]);
      if (areasRes.data.success) {
        setAreas(areasRes.data.data);
        if (!routeAreaId && areasRes.data.data.length > 0) setRouteAreaId(areasRes.data.data[0].id);
      }
      if (routesRes.data.success) setRoutes(routesRes.data.data);
      if (custRes.data.success) {
        setCustomers(custRes.data.customers || []);
        if (!assignCustomerId && custRes.data.customers?.length > 0) {
          setAssignCustomerId(custRes.data.customers[0].id);
        }
      }

      if (isAdmin) {
        const usersRes = await api.get('/users');
        if (usersRes.data.success) {
          setCollectors((usersRes.data.users || []).filter((u) => u.active));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load route management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadSchedule = async (route) => {
    try {
      setSelectedRoute(route);
      const res = await api.get(`/routes/${route.id}/schedule`);
      if (res.data.success) setSchedule(res.data.data);
    } catch (err) {
      setError('Failed to load route schedule.');
    }
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/routes/areas', { name: areaName, code: areaCode });
      if (res.data.success) {
        setAreaName('');
        setAreaCode('');
        setSuccess('Collection area created.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create area.');
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/routes', {
        name: routeName,
        code: routeCode,
        areaId: routeAreaId,
        collectorId: routeCollectorId || null,
      });
      if (res.data.success) {
        setRouteName('');
        setRouteCode('');
        setSuccess('Collection route created.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create route.');
    }
  };

  const handleAssignCustomer = async (e) => {
    e.preventDefault();
    if (!selectedRoute || !assignCustomerId) return;
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/routes/${selectedRoute.id}/assign-customer`, {
        customerId: assignCustomerId,
      });
      if (res.data.success) {
        setSuccess('Borrower assigned to route.');
        loadSchedule(selectedRoute);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign borrower.');
    }
  };

  const handleRemoveCustomer = async (customerId) => {
    if (!selectedRoute) return;
    try {
      await api.delete(`/routes/${selectedRoute.id}/customers/${customerId}`);
      loadSchedule(selectedRoute);
      fetchData();
    } catch (err) {
      setError('Failed to remove borrower from route.');
    }
  };

  const filteredRoutes = filterAreaId ? routes.filter((r) => r.areaId === filterAreaId) : routes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-slate-800" /> Collection Route Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage collection areas, field routes, collector assignments & daily visit schedules
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
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collection Areas</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{areas.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Routes</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{routes.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Borrowers</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {routes.reduce((sum, r) => sum + (r._count?.customers || 0), 0)}
          </p>
        </div>
      </div>

      {/* Admin Creation Forms */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleCreateArea} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Collection Area
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Area Name (e.g. Market Yard)"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
              />
              <input
                type="text"
                required
                placeholder="Area Code (e.g. MKT)"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#789486] text-white font-bold text-xs hover:brightness-95 transition"
            >
              Add Area
            </button>
          </form>

          <form onSubmit={handleCreateRoute} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Collection Route
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Route Name (e.g. Morning Route A)"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
              />
              <input
                type="text"
                required
                placeholder="Route Code (e.g. RT-01)"
                value={routeCode}
                onChange={(e) => setRouteCode(e.target.value)}
                className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
              />
              <select
                required
                value={routeAreaId}
                onChange={(e) => setRouteAreaId(e.target.value)}
                className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
              >
                <option value="">-- Select Area --</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                ))}
              </select>
              <select
                value={routeCollectorId}
                onChange={(e) => setRouteCollectorId(e.target.value)}
                className="px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
              >
                <option value="">-- Assign Collector (Optional) --</option>
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Create Route
            </button>
          </form>
        </div>
      )}

      {/* Routes List + Filter */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-900">Collection Routes</h2>
          <select
            value={filterAreaId}
            onChange={(e) => setFilterAreaId(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#789486]"
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-stone-200">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Route Name</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Collector</th>
                <th className="py-3 px-4">Borrowers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">Loading routes...</td></tr>
              ) : filteredRoutes.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-slate-400">No routes created yet.</td></tr>
              ) : (
                filteredRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.name}</td>
                    <td className="py-3 px-4 text-slate-600">{r.area?.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {r.collector?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{r._count?.customers || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => loadSchedule(r)}
                        className="px-3 py-1.5 rounded-lg bg-[#789486] text-white font-bold text-xs hover:brightness-95 transition"
                      >
                        Manage & Schedule
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Route Schedule & Borrower Assignment */}
      {selectedRoute && schedule && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {schedule.name} ({schedule.code}) — Daily Schedule
              </h3>
              <p className="text-xs text-slate-500">Area: {schedule.area?.name}</p>
            </div>
            <form onSubmit={handleAssignCustomer} className="flex items-center gap-2">
              <select
                value={assignCustomerId}
                onChange={(e) => setAssignCustomerId(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-stone-300"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.customerCode})</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Assign Borrower
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-stone-200">
                  <th className="py-2.5 px-4">Borrower</th>
                  <th className="py-2.5 px-4">Mobile</th>
                  <th className="py-2.5 px-4">Active Accounts</th>
                  <th className="py-2.5 px-4">Pending / Overdue Due Today</th>
                  <th className="py-2.5 px-4 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {schedule.customers.length === 0 ? (
                  <tr><td colSpan="5" className="py-6 text-center text-slate-400">No borrowers assigned to this route yet.</td></tr>
                ) : (
                  schedule.customers.map((cr) => {
                    const dueTotal = (cr.customer.accounts || []).reduce(
                      (sum, acc) =>
                        sum +
                        (acc.instalments || []).reduce(
                          (s, inst) => s + Math.max(0, Number(inst.scheduledAmount) - Number(inst.paidAmount)),
                          0
                        ),
                      0
                    );
                    return (
                      <tr key={cr.id} className="hover:bg-stone-50/60">
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {cr.customer.name} <span className="text-xs text-slate-400">({cr.customer.customerCode})</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{cr.customer.mobile}</td>
                        <td className="py-2.5 px-4 text-slate-700">{cr.customer.accounts?.length || 0}</td>
                        <td className="py-2.5 px-4 font-bold text-[#E10600]">₹{dueTotal.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveCustomer(cr.customer.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#E10600] hover:bg-red-50 transition"
                            title="Remove from route"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;
