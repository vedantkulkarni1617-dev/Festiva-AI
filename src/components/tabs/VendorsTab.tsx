import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Trash2,
  Edit2,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { EventRecord, VendorItem, VendorStatus, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services/currencyService';

interface VendorsTabProps {
  event: EventRecord;
  currency: CurrencyCode;
  onUpdateEvent: (updated: EventRecord) => void;
}

export const VendorsTab: React.FC<VendorsTabProps> = ({
  event,
  currency,
  onUpdateEvent,
}) => {
  const vendors = event.vendors || [];

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Add Vendor Modal
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [newCategory, setNewCategory] = useState('Venue');
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhoneEmail, setNewPhoneEmail] = useState('');
  const [newStatus, setNewStatus] = useState<VendorStatus>('Researching');
  const [newEstimatedCost, setNewEstimatedCost] = useState<number>(1500);
  const [newNotes, setNewNotes] = useState('');

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<VendorStatus>('Researching');
  const [editNotes, setEditNotes] = useState('');
  const [editCost, setEditCost] = useState<number>(0);

  const vendorCategories = [
    'Venue',
    'Caterer',
    'Decorator',
    'Photographer',
    'Videographer',
    'Entertainment',
    'Florist',
    'Transportation',
    'Invitations',
    'Other Service',
  ];

  // Status badge helper
  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'Booked':
        return (
          <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)] px-2.5 py-0.5 rounded-full">
            Booked
          </span>
        );
      case 'Quoted':
        return (
          <span className="text-[11px] font-mono font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.25)] px-2.5 py-0.5 rounded-full">
            Quote Received
          </span>
        );
      case 'Contacted':
        return (
          <span className="text-[11px] font-mono font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
            Contacted
          </span>
        );
      case 'Declined':
        return (
          <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded-full">
            Declined
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded-full">
            Researching
          </span>
        );
    }
  };

  // Update vendor status directly
  const handleQuickStatusChange = (id: string, newStatus: VendorStatus) => {
    const updated = vendors.map(v => (v.id === id ? { ...v, status: newStatus } : v));
    onUpdateEvent({ ...event, vendors: updated });
  };

  // Delete vendor
  const handleDeleteVendor = (id: string) => {
    const filtered = vendors.filter(v => v.id !== id);
    onUpdateEvent({ ...event, vendors: filtered });
  };

  // Start inline editing
  const handleStartEdit = (v: VendorItem) => {
    setEditingId(v.id);
    setEditStatus(v.status);
    setEditNotes(v.notes || '');
    setEditCost(v.confirmedCost || v.estimatedCost);
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    const updated = vendors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: editStatus,
          notes: editNotes.trim(),
          confirmedCost: editStatus === 'Booked' ? editCost : v.confirmedCost,
          estimatedCost: editCost,
        };
      }
      return v;
    });

    onUpdateEvent({ ...event, vendors: updated });
    setEditingId(null);
  };

  // Add Vendor submit
  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newVendor: VendorItem = {
      id: `v-custom-${Date.now()}`,
      category: newCategory,
      name: newName.trim(),
      contactPerson: newContact.trim(),
      phoneOrEmail: newPhoneEmail.trim(),
      status: newStatus,
      estimatedCost: Math.max(0, newEstimatedCost),
      notes: newNotes.trim(),
    };

    onUpdateEvent({
      ...event,
      vendors: [...vendors, newVendor],
    });

    setNewName('');
    setNewContact('');
    setNewPhoneEmail('');
    setNewNotes('');
    setIsAddingVendor(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Vendor Name', 'Contact Person', 'Phone / Email', 'Status', 'Estimated Cost', 'Confirmed Cost', 'Notes'];
    const rows = vendors.map(v => [
      `"${v.category}"`,
      `"${v.name}"`,
      `"${v.contactPerson || ''}"`,
      `"${v.phoneOrEmail || ''}"`,
      `"${v.status}"`,
      v.estimatedCost,
      v.confirmedCost || '',
      `"${(v.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Vendors.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const matchSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || v.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  // Stats
  const totalVendors = vendors.length;
  const bookedCount = vendors.filter(v => v.status === 'Booked').length;
  const quotedCount = vendors.filter(v => v.status === 'Quoted').length;
  const researchingCount = vendors.filter(v => v.status === 'Researching').length;

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* Header & KPI Summary */}
      <div className="glass-panel rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Vendor Procurement Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Live Status
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Track vendor proposals, bids, and contracts without fabricated availability
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddingVendor(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Status Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="text-[11px] text-slate-500 font-mono">Total Vendors</div>
            <div className="text-lg font-bold font-mono text-white">{totalVendors}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
            <div className="text-[11px] text-emerald-400 font-mono">Booked & Confirmed</div>
            <div className="text-lg font-bold font-mono text-emerald-300">{bookedCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
            <div className="text-[11px] text-cyan-400 font-mono">Quotes Under Review</div>
            <div className="text-lg font-bold font-mono text-cyan-300">{quotedCount}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
            <div className="text-[11px] text-slate-500 font-mono">In Research</div>
            <div className="text-lg font-bold font-mono text-slate-400">{researchingCount}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/10">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vendor name, service, or notes..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-900/80 border border-white/15 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-2 bg-slate-900 border border-white/15 rounded-lg text-white cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="Researching" className="bg-slate-900">Researching</option>
              <option value="Contacted" className="bg-slate-900">Contacted</option>
              <option value="Quoted" className="bg-slate-900">Quoted</option>
              <option value="Booked" className="bg-slate-900">Booked</option>
              <option value="Declined" className="bg-slate-900">Declined</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-2 bg-slate-900 border border-white/15 rounded-lg text-white cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {vendorCategories.map(c => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map(vendor => {
          const isEditing = editingId === vendor.id;

          return (
            <div
              key={vendor.id}
              className="glass-panel glass-panel-hover rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Category & Status Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {vendor.category}
                  </span>
                  {!isEditing ? (
                    <select
                      value={vendor.status}
                      onChange={e => handleQuickStatusChange(vendor.id, e.target.value as VendorStatus)}
                      className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md border border-white/15 bg-slate-900 text-slate-200 cursor-pointer"
                    >
                      <option value="Researching" className="bg-slate-900">Researching</option>
                      <option value="Contacted" className="bg-slate-900">Contacted</option>
                      <option value="Quoted" className="bg-slate-900">Quoted</option>
                      <option value="Booked" className="bg-slate-900">Booked</option>
                      <option value="Declined" className="bg-slate-900">Declined</option>
                    </select>
                  ) : (
                    getStatusBadge(editStatus)
                  )}
                </div>

                {/* Name */}
                <h4 className="text-base font-bold text-white leading-snug">{vendor.name}</h4>

                {/* Contact metadata */}
                {(vendor.contactPerson || vendor.phoneOrEmail) && (
                  <div className="text-xs text-slate-400 space-y-0.5">
                    {vendor.contactPerson && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{vendor.contactPerson}</span>
                      </div>
                    )}
                    {vendor.phoneOrEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{vendor.phoneOrEmail}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {vendor.notes && !isEditing && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                    {vendor.notes}
                  </p>
                )}

                {/* Inline Editing Inputs */}
                {isEditing && (
                  <div className="space-y-2 pt-2 bg-slate-900/90 p-3 rounded-lg border border-white/10 text-xs">
                    <div>
                      <label className="font-semibold text-slate-300">Status</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as VendorStatus)}
                        className="w-full mt-1 p-1.5 bg-slate-950 border border-white/15 rounded text-white"
                      >
                        <option value="Researching" className="bg-slate-950">Researching</option>
                        <option value="Contacted" className="bg-slate-950">Contacted</option>
                        <option value="Quoted" className="bg-slate-950">Quoted</option>
                        <option value="Booked" className="bg-slate-950">Booked</option>
                        <option value="Declined" className="bg-slate-950">Declined</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300">Cost Quote ({currency})</label>
                      <input
                        type="number"
                        min={0}
                        value={editCost}
                        onChange={e => setEditCost(Number(e.target.value))}
                        className="w-full mt-1 p-1.5 bg-slate-950 border border-white/15 rounded text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-300">Notes / Scope</label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="w-full mt-1 p-1.5 bg-slate-950 border border-white/15 rounded text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: Price & Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                    {vendor.status === 'Booked' ? 'Confirmed Fee' : 'Estimated Quote'}
                  </span>
                  <div className="font-mono font-bold text-sm text-cyan-300">
                    {formatCurrency(vendor.confirmedCost || vendor.estimatedCost, currency)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(vendor)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                      title="Edit vendor details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveEdit(vendor.id)}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                      title="Save changes"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                    title="Remove vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {isAddingVendor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070913]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d1326] rounded-xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-4">
            <h3 className="text-base font-bold text-white">Add Event Vendor</h3>
            <form onSubmit={handleAddVendorSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Service Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white cursor-pointer"
                >
                  {vendorCategories.map(c => (
                    <option key={c} value={c} className="bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Vendor / Business Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Lumina Visual Media"
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={e => setNewContact(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Estimated Quote ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={newEstimatedCost}
                    onChange={e => setNewEstimatedCost(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone or Email</label>
                <input
                  type="text"
                  value={newPhoneEmail}
                  onChange={e => setNewPhoneEmail(e.target.value)}
                  placeholder="e.g. sarah@luminavisuals.com"
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as VendorStatus)}
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white cursor-pointer"
                >
                  <option value="Researching" className="bg-slate-900">Researching</option>
                  <option value="Contacted" className="bg-slate-900">Contacted</option>
                  <option value="Quoted" className="bg-slate-900">Quoted</option>
                  <option value="Booked" className="bg-slate-900">Booked</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Scope</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. 8 hours coverage, 2 shooters, online gallery"
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVendor(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
