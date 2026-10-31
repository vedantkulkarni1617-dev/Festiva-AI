import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Check,
  Download,
  Info,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { EventRecord, BudgetItem, CurrencyCode } from '../../types';
import { formatCurrency } from '../../services/currencyService';

interface BudgetTabProps {
  event: EventRecord;
  currency: CurrencyCode;
  onUpdateEvent: (updated: EventRecord) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({
  event,
  currency,
  onUpdateEvent,
}) => {
  const budget = event.budget;
  const items = budget.items || [];
  const totalBudget = event.totalBudget || 0;

  // Editing state for an item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEstimated, setEditEstimated] = useState<number>(0);
  const [editActual, setEditActual] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Add custom category modal state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEstimated, setNewCategoryEstimated] = useState<number>(1000);
  const [newCategoryNotes, setNewCategoryNotes] = useState('');

  // Active slice for hover interaction on SVG donut
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute sums
  const plannedSpend = items.reduce((sum, item) => sum + (item.actualCost || item.estimatedCost || 0), 0);
  const remainingBudget = totalBudget - plannedSpend;
  const isOverBudget = remainingBudget < 0;
  const percentUsed = totalBudget > 0 ? Math.round((plannedSpend / totalBudget) * 100) : 0;

  // Color palette for slices
  const sliceColors = [
    '#6366F1', // Indigo
    '#F43F5E', // Rose
    '#0EA5E9', // Sky
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#64748B', // Slate
    '#EAB308', // Yellow
  ];

  // Start inline editing
  const handleStartEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditEstimated(item.estimatedCost);
    setEditActual(item.actualCost || item.estimatedCost);
    setEditNotes(item.notes || '');
  };

  // Save inline edits
  const handleSaveEdit = (id: string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const est = Math.max(0, editEstimated);
        const act = Math.max(0, editActual);
        return {
          ...item,
          estimatedCost: est,
          actualCost: act,
          notes: editNotes.trim(),
          percentage: totalBudget > 0 ? Math.round((act / totalBudget) * 1000) / 10 : 0,
        };
      }
      return item;
    });

    onUpdateEvent({
      ...event,
      budget: {
        ...budget,
        items: updatedItems,
      },
    });
    setEditingId(null);
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    onUpdateEvent({
      ...event,
      budget: {
        ...budget,
        items: filtered,
      },
    });
  };

  // Add custom category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newItem: BudgetItem = {
      id: `b-custom-${Date.now()}`,
      category: newCategoryName.trim(),
      estimatedCost: Math.max(0, newCategoryEstimated),
      actualCost: Math.max(0, newCategoryEstimated),
      percentage: totalBudget > 0 ? Math.round((newCategoryEstimated / totalBudget) * 1000) / 10 : 0,
      notes: newCategoryNotes.trim() || 'Custom user expense',
      isCustom: true,
    };

    onUpdateEvent({
      ...event,
      budget: {
        ...budget,
        items: [...items, newItem],
      },
    });

    setNewCategoryName('');
    setNewCategoryEstimated(1000);
    setNewCategoryNotes('');
    setIsAddingCategory(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Estimated Cost', 'Actual / Planned Cost', '% of Budget', 'Notes'];
    const rows = items.map(item => [
      `"${item.category}"`,
      item.estimatedCost,
      item.actualCost || item.estimatedCost,
      `${item.percentage}%`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_Budget.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Donut Math
  const totalItemSpend = items.reduce((sum, item) => sum + (item.actualCost || item.estimatedCost || 0), 0) || 1;
  let accumulatedAngle = 0;
  const donutSlices = items.map((item, idx) => {
    const val = item.actualCost || item.estimatedCost || 0;
    const ratio = val / totalItemSpend;
    const angle = ratio * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      category: item.category,
      value: val,
      ratio,
      startAngle,
      angle,
      color: sliceColors[idx % sliceColors.length],
    };
  });

  // Calculate SVG arc path
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Warning Banner if Over Budget */}
      {isOverBudget && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm">
            <h4 className="font-bold text-rose-900">Budget Limit Exceeded</h4>
            <p className="text-rose-800">
              Total planned expenses exceed your budget by{' '}
              <span className="font-mono font-bold">{formatCurrency(Math.abs(remainingBudget), currency)}</span>.
              Consider reallocating non-critical items or increasing the total event budget.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Target Budget
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(totalBudget, currency)}
          </div>
          <p className="text-xs text-slate-400">Baseline funding allocation</p>
        </div>

        {/* Planned Spending Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Planned Expenses</span>
            <span className="text-xs font-mono font-bold text-indigo-600">{percentUsed}% used</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(plannedSpend, currency)}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all ${
                isOverBudget ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Buffer Card */}
        <div className={`rounded-xl border p-5 shadow-sm space-y-1 ${
          isOverBudget ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/40 border-emerald-200'
        }`}>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            {isOverBudget ? (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            )}
            <span>{isOverBudget ? 'Budget Deficit' : 'Remaining Buffer'}</span>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
            isOverBudget ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {formatCurrency(Math.abs(remainingBudget), currency)}
          </div>
          <p className="text-xs text-slate-500">
            {isOverBudget ? 'Over allocated total' : 'Available for contingencies'}
          </p>
        </div>
      </div>

      {/* Visual Donut Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donut Visualization (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="w-full flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <span>Category Allocation</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{items.length} Categories</span>
          </div>

          {/* SVG Donut */}
          <div className="relative w-56 h-56 flex items-center justify-center my-2">
            <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90 transform">
              {donutSlices.map((slice, idx) => {
                const isHovered = hoveredIndex === idx;
                const strokeWidth = isHovered ? 0.38 : 0.32;
                // Calculate arc path using dasharray
                const circumference = 2 * Math.PI * 0.7; // radius 0.7
                const strokeDasharray = `${slice.ratio * circumference} ${circumference}`;
                const strokeDashoffset = -slice.startAngle * (circumference / 360);

                return (
                  <circle
                    key={idx}
                    cx="0"
                    cy="0"
                    r="0.7"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              {hoveredIndex !== null && items[hoveredIndex] ? (
                <div className="space-y-0.5 animate-fadeIn">
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                    {items[hoveredIndex].category}
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {formatCurrency(items[hoveredIndex].actualCost || items[hoveredIndex].estimatedCost, currency)}
                  </div>
                  <div className="text-[10px] font-semibold text-indigo-600">
                    {items[hoveredIndex].percentage}%
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {formatCurrency(plannedSpend, currency, true)}
                  </span>
                  <span className="text-[10px] text-slate-400">allocated</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Legend Grid */}
          <div className="w-full grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {donutSlices.slice(0, 8).map((slice, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition-colors ${
                  hoveredIndex === idx ? 'bg-indigo-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate flex-1">{slice.category}</span>
                <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                  {Math.round(slice.ratio * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Table & Allocations (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expense Allocations</h3>
              <p className="text-xs text-slate-500">Edit values to dynamically recalculate remaining balance</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="Export budget spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const isEditing = editingId === item.id;
              const color = sliceColors[idx % sliceColors.length];

              return (
                <div
                  key={item.id}
                  className="py-3 hover:bg-slate-50/60 transition-colors px-2 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                        {item.category}
                      </span>
                      {item.isCustom && (
                        <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Cost & Edit Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-900">
                        {formatCurrency(item.actualCost || item.estimatedCost, currency)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono w-10 text-right">
                        {item.percentage}%
                      </span>
                      {!isEditing ? (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit allocation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Save changes"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {items.length > 2 && (
                        <button
                          onClick={() => handleDeleteCategory(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline edit inputs if active */}
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">
                          Planned Cost ({currency})
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editActual}
                          onChange={e => setEditActual(Number(e.target.value))}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">
                          Budget Notes
                        </label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={e => setEditNotes(e.target.value)}
                          placeholder="e.g. Includes deposit and staff tips"
                          className="w-full text-xs px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  ) : item.notes ? (
                    <p className="text-[11px] text-slate-500 pl-4">{item.notes}</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>All amounts are estimated planning allocations.</span>
            </span>
            <span className="font-mono font-bold text-slate-900">
              Total: {formatCurrency(plannedSpend, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Add Custom Category Modal */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Custom Expense Category</h3>
            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Fireworks & Special FX, Childcare, Favors"
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Estimated Cost ({currency})</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newCategoryEstimated}
                  onChange={e => setNewCategoryEstimated(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Notes (Optional)</label>
                <input
                  type="text"
                  value={newCategoryNotes}
                  onChange={e => setNewCategoryNotes(e.target.value)}
                  placeholder="e.g. 3 vendor quotes requested"
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
