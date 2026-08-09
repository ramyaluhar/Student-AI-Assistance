// pages/AdminPanel.jsx
// Admin Panel: platform-wide stats + student account management.

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiHelpCircle, FiMessageSquare, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { getAllUsersApi, toggleUserStatusApi, deleteUserApi, getPlatformStatsApi } from '../api/adminApi';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [statsRes, usersRes] = await Promise.all([getPlatformStatsApi(), getAllUsersApi()]);
    setStats(statsRes.data.data);
    setUsers(usersRes.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id) => {
    await toggleUserStatusApi(id);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this student account?')) return;
    await deleteUserApi(id);
    toast.success('Student account deleted');
    loadData();
  };

  if (loading) {
    return <DashboardLayout title="Admin Panel"><Loader full /></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Admin Panel">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={FiUsers} label="Total Students" value={stats.totalStudents} color="indigo" />
        <StatCard icon={FiUsers} label="Active Students" value={stats.activeStudents} color="green" />
        <StatCard icon={FiFileText} label="Notes Uploaded" value={stats.totalNotes} color="blue" />
        <StatCard icon={FiHelpCircle} label="Quizzes Created" value={stats.totalQuizzes} color="orange" />
        <StatCard icon={FiMessageSquare} label="AI Chats" value={stats.totalChats} color="pink" />
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Manage Students</h3>
        {users.length === 0 ? (
          <EmptyState icon={FiUsers} title="No students registered yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">College</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                    <td className="py-3 text-gray-800 dark:text-gray-100 font-medium">{u.name}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{u.college || '—'}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => handleToggle(u._id)} title="Toggle active status" className="text-gray-400 hover:text-primary-600">
                          {u.isActive ? <FiToggleRight size={20} className="text-green-500" /> : <FiToggleLeft size={20} />}
                        </button>
                        <FiTrash2 size={15} className="text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => handleDelete(u._id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
