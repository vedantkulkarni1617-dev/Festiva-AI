import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  AlertCircle,
  Flag,
  Trash2,
  Edit2,
  Check,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventRecord, TimelineTask, PriorityLevel } from '../../types';

interface TimelineTabProps {
  event: EventRecord;
  onUpdateEvent: (updated: EventRecord) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  event,
  onUpdateEvent,
}) => {
  const tasks = event.timeline || [];
  const eventDate = new Date(event.date);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');

  // Add Task Modal state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPhase, setNewTaskPhase] = useState<TimelineTask['phase']>('Several Weeks Before');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('Medium');
  const [newTaskDaysBefore, setNewTaskDaysBefore] = useState<number>(14);

  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<PriorityLevel>('Medium');

  // Toggle task completion
  const handleToggleComplete = (taskId: string) => {
    let allFinished = false;
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        return { ...t, completed: nextState };
      }
      return t;
    });

    const completedCount = updatedTasks.filter(t => t.completed).length;
    if (completedCount === updatedTasks.length && updatedTasks.length > 0) {
      allFinished = true;
    }

    onUpdateEvent({
      ...event,
      timeline: updatedTasks,
    });

    if (allFinished) {
      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const filtered = tasks.filter(t => t.id !== taskId);
    onUpdateEvent({
      ...event,
      timeline: filtered,
    });
  };

  // Start inline editing
  const handleStartEdit = (t: TimelineTask) => {
    setEditingTaskId(t.id);
    setEditTitle(t.title);
    setEditDesc(t.description);
    setEditPriority(t.priority);
  };

  // Save inline edit
  const handleSaveEdit = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          title: editTitle.trim() || t.title,
          description: editDesc.trim(),
          priority: editPriority,
        };
      }
      return t;
    });

    onUpdateEvent({
      ...event,
      timeline: updated,
    });
    setEditingTaskId(null);
  };

  // Add custom task
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskDate = new Date(eventDate.getTime() - newTaskDaysBefore * 24 * 60 * 60 * 1000);
    const deadlineStr = isNaN(taskDate.getTime()) ? event.date : taskDate.toISOString().split('T')[0];

    const newTask: TimelineTask = {
      id: `t-cust-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      phase: newTaskPhase,
      daysBeforeEvent: newTaskDaysBefore,
      suggestedDeadline: deadlineStr,
      priority: newTaskPriority,
      completed: false,
    };

    onUpdateEvent({
      ...event,
      timeline: [...tasks, newTask],
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddingTask(false);
  };

  // Completion calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending') return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    if (activeFilter === 'high') return t.priority === 'High';
    return true;
  });

  // Organize by phase
  const phases: TimelineTask['phase'][] = [
    'Several Weeks Before',
    'Month Before',
    'Final Week',
    'Day Before',
    'Event Day',
  ];

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'High':
        return (
          <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)] px-2 py-0.5 rounded">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-900 border border-white/10 px-2 py-0.5 rounded">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12 text-slate-100">
      {/* Header & Progress Card */}
      <div className="glass-panel rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Preparation Milestones Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Date-Aware
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Tasks mapped backward from {new Date(event.date).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingTask(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Phase Completion</span>
            <span className="font-mono font-bold text-cyan-400">
              {completedTasks} of {totalTasks} Completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-full transition-all duration-300 shadow-[0_0_10px_#22d3ee]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'All Tasks' },
              { id: 'pending', label: `Pending (${totalTasks - completedTasks})` },
              { id: 'completed', label: `Completed (${completedTasks})` },
              { id: 'high', label: 'High Priority' },
            ] as const
          ).map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped by Phases */}
      <div className="space-y-6">
        {phases.map(phaseName => {
          const phaseTasks = filteredTasks.filter(t => t.phase === phaseName);
          if (phaseTasks.length === 0) return null;

          return (
            <div key={phaseName} className="glass-panel rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  {phaseName}
                </h4>
                <span className="text-[11px] font-mono font-semibold text-cyan-400">
                  {phaseTasks.filter(t => t.completed).length}/{phaseTasks.length} Done
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {phaseTasks.map(task => {
                  const isEditing = editingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 transition-colors ${
                        task.completed ? 'bg-slate-950/40' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Checkbox & Details */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(task.id)}
                            className="mt-0.5 focus:outline-none transition-transform hover:scale-110"
                            title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600 hover:text-cyan-400" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0 flex-1">
                            {!isEditing ? (
                              <>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h5
                                    className={`text-sm font-semibold ${
                                      task.completed
                                        ? 'line-through text-slate-500 font-normal'
                                        : 'text-white'
                                    }`}
                                  >
                                    {task.title}
                                  </h5>
                                  {getPriorityBadge(task.priority)}
                                </div>
                                {task.description && (
                                  <p
                                    className={`text-xs ${
                                      task.completed ? 'text-slate-500' : 'text-slate-400'
                                    }`}
                                  >
                                    {task.description}
                                  </p>
                                )}
                              </>
                            ) : (
                              <div className="space-y-2 pt-1 bg-slate-900/90 p-3 rounded-lg border border-white/10">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={e => setEditTitle(e.target.value)}
                                  className="w-full text-xs font-semibold px-2 py-1 bg-slate-950 border border-white/15 rounded text-white"
                                />
                                <textarea
                                  rows={2}
                                  value={editDesc}
                                  onChange={e => setEditDesc(e.target.value)}
                                  className="w-full text-xs px-2 py-1 bg-slate-950 border border-white/15 rounded text-white"
                                />
                                <div className="flex items-center gap-2">
                                  <label className="text-[10px] text-slate-400 font-semibold">Priority:</label>
                                  {(['High', 'Medium', 'Low'] as PriorityLevel[]).map(p => (
                                    <button
                                      type="button"
                                      key={p}
                                      onClick={() => setEditPriority(p)}
                                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                        editPriority === p
                                          ? 'bg-cyan-500 text-slate-950'
                                          : 'bg-slate-900 border border-white/10 text-slate-400'
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested Deadline */}
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              <span>Target: {new Date(task.suggestedDeadline).toLocaleDateString()}</span>
                              <span>·</span>
                              <span>{task.daysBeforeEvent}d before event</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!isEditing ? (
                            <button
                              onClick={() => handleStartEdit(task)}
                              className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                              title="Edit milestone"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveEdit(task.id)}
                              className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded transition-colors"
                              title="Save edits"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                            title="Delete milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070913]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d1326] rounded-xl max-w-md w-full p-6 shadow-2xl border border-white/15 space-y-4">
            <h3 className="text-base font-bold text-white">Add Preparation Milestone</h3>
            <form onSubmit={handleAddTaskSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule venue acoustics walk-through"
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={e => setNewTaskDesc(e.target.value)}
                  placeholder="e.g. Coordinate timing with sound engineer and coordinator"
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phase</label>
                  <select
                    value={newTaskPhase}
                    onChange={e => setNewTaskPhase(e.target.value as TimelineTask['phase'])}
                    className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-white/15 rounded-lg text-white cursor-pointer"
                  >
                    {phases.map(p => (
                      <option key={p} value={p} className="bg-slate-900">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs px-2.5 py-2 bg-slate-900 border border-white/15 rounded-lg text-white cursor-pointer"
                  >
                    <option value="High" className="bg-slate-900">High</option>
                    <option value="Medium" className="bg-slate-900">Medium</option>
                    <option value="Low" className="bg-slate-900">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Days Before Event ({newTaskDaysBefore} days before)
                </label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={newTaskDaysBefore}
                  onChange={e => setNewTaskDaysBefore(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
