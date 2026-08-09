// pages/Planner.jsx
// Study Planner: manual task CRUD + AI-generated weekly plan.

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiZap, FiTrash2, FiCalendar, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { createTaskApi, getTasksApi, updateTaskApi, deleteTaskApi, generateAIPlanApi } from '../api/plannerApi';

const priorityColor = { low: 'bg-gray-100 text-gray-600', medium: 'bg-amber-100 text-amber-700', high: 'bg-red-100 text-red-700' };

const Planner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);
  const [form, setForm] = useState({ subject: '', task: '', date: '', duration: 60, priority: 'medium' });
  const [aiForm, setAiForm] = useState({ subjects: '', hoursPerDay: 2, examDate: '' });

  const loadTasks = async () => {
    const res = await getTasksApi();
    setTasks(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.task || !form.date) return toast.error('Please fill all required fields');
    setCreating(true);
    try {
      await createTaskApi(form);
      toast.success('Task added');
      setForm({ subject: '', task: '', date: '', duration: 60, priority: 'medium' });
      loadTasks();
    } finally {
      setCreating(false);
    }
  };

  const toggleComplete = async (task) => {
    await updateTaskApi(task._id, { completed: !task.completed });
    loadTasks();
  };

  const handleDelete = async (id) => {
    await deleteTaskApi(id);
    toast.success('Task removed');
    loadTasks();
  };

  const handleAIGenerate = async (e) => {
    e.preventDefault();
    const subjects = aiForm.subjects.split(',').map((s) => s.trim()).filter(Boolean);
    if (!subjects.length) return toast.error('Enter at least one subject');

    setAiGenerating(true);
    try {
      await generateAIPlanApi({ subjects, hoursPerDay: Number(aiForm.hoursPerDay), examDate: aiForm.examDate || undefined });
      toast.success('AI weekly plan generated!');
      setShowAIForm(false);
      loadTasks();
    } finally {
      setAiGenerating(false);
    }
  };

  const grouped = tasks.reduce((acc, t) => {
    const day = new Date(t.date).toDateString();
    acc[day] = acc[day] || [];
    acc[day].push(t);
    return acc;
  }, {});

  return (
    <DashboardLayout title="Study Planner">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-1 h-fit space-y-5">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Add Study Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="input-field" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <input className="input-field" placeholder="Task (e.g. Revise Ch.4)" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} />
              <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" min="15" step="15" className="input-field" placeholder="Duration (min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                <select className="input-field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" disabled={creating} className="btn-primary w-full text-sm">
                {creating ? <Loader size="sm" /> : <><FiPlus size={15} /> Add Task</>}
              </button>
            </form>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <button onClick={() => setShowAIForm((v) => !v)} className="btn-secondary w-full text-sm mb-3">
              <FiZap size={15} /> Generate AI Weekly Plan
            </button>
            {showAIForm && (
              <form onSubmit={handleAIGenerate} className="space-y-3 animate-slide-up">
                <input className="input-field" placeholder="Subjects (comma separated)" value={aiForm.subjects} onChange={(e) => setAiForm({ ...aiForm, subjects: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="1" max="12" className="input-field" placeholder="Hrs/day" value={aiForm.hoursPerDay} onChange={(e) => setAiForm({ ...aiForm, hoursPerDay: e.target.value })} />
                  <input type="date" className="input-field" value={aiForm.examDate} onChange={(e) => setAiForm({ ...aiForm, examDate: e.target.value })} />
                </div>
                <button type="submit" disabled={aiGenerating} className="btn-primary w-full text-sm">
                  {aiGenerating ? <Loader size="sm" label="Planning..." /> : 'Generate Plan'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <Loader />
          ) : tasks.length === 0 ? (
            <div className="card"><EmptyState icon={FiCalendar} title="No study tasks yet" description="Add a task manually or generate an AI weekly plan." /></div>
          ) : (
            Object.entries(grouped).map(([day, dayTasks]) => (
              <div key={day} className="card">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">{day}</h4>
                <div className="space-y-2">
                  {dayTasks.map((t) => (
                    <div key={t._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <button onClick={() => toggleComplete(t)} className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${t.completed ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                        {t.completed && <FiCheck size={13} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${t.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{t.task}</p>
                        <p className="text-xs text-gray-400">{t.subject} • {t.duration} min {t.aiGenerated && '• ✨ AI'}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${priorityColor[t.priority]}`}>{t.priority}</span>
                      <FiTrash2 size={15} className="text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => handleDelete(t._id)} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Planner;
