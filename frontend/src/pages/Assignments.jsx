// pages/Assignments.jsx
// Assignment Reminder: CRUD list of assignments with due dates and status.

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiClipboard, FiClock } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { createAssignmentApi, getAssignmentsApi, updateAssignmentApi, deleteAssignmentApi } from '../api/assignmentApi';

const statusStyles = {
  pending: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const Assignments = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', description: '', dueDate: '' });

  const loadItems = async () => {
    const res = await getAssignmentsApi();
    setItems(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return toast.error('Title and due date are required');
    setCreating(true);
    try {
      await createAssignmentApi(form);
      toast.success('Assignment added');
      setForm({ title: '', subject: '', description: '', dueDate: '' });
      loadItems();
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id, status) => {
    await updateAssignmentApi(id, { status });
    loadItems();
  };

  const handleDelete = async (id) => {
    await deleteAssignmentApi(id);
    toast.success('Assignment removed');
    loadItems();
  };

  const daysLeft = (dueDate) => {
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due today';
    return `${diff} day${diff > 1 ? 's' : ''} left`;
  };

  return (
    <DashboardLayout title="Assignment Reminders">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-1 h-fit">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Add Assignment</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="input-field" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea className="input-field" rows="3" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="date" className="input-field" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <button type="submit" disabled={creating} className="btn-primary w-full text-sm">
              {creating ? <Loader size="sm" /> : <><FiPlus size={15} /> Add Reminder</>}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Assignments</h3>
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState icon={FiClipboard} title="No assignments yet" description="Add your first deadline reminder using the form." />
          ) : (
            <div className="space-y-3">
              {items.map((a) => (
                <div key={a._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-100">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.subject}</p>
                      {a.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{a.description}</p>}
                    </div>
                    <FiTrash2 size={15} className="text-gray-300 hover:text-red-500 cursor-pointer shrink-0" onClick={() => handleDelete(a._id)} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiClock size={12} /> {daysLeft(a.dueDate)} · {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a._id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 capitalize ${statusStyles[a.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
