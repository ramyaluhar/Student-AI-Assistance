// pages/Profile.jsx
// Student Profile: view/edit personal & academic info, change password.

import React, { useState } from 'react';
import { FiSave, FiUser } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    semester: user?.semester || 1,
    password: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { password, ...rest } = form;
      const payload = password ? { ...rest, password } : rest;
      await updateProfile(payload);
      setForm((f) => ({ ...f, password: '' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl">
        <div className="card mb-5 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FiUser size={16} /> Edit Profile
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">College / Institute</label>
              <input className="input-field" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Branch</label>
                <input className="input-field" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
              </div>
              <div>
                <label className="label">Semester</label>
                <select className="input-field" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">New Password (leave blank to keep current)</label>
              <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader size="sm" /> : <><FiSave size={15} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
