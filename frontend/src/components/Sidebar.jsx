// components/Sidebar.jsx
// Main app navigation. Collapses to a bottom/off-canvas drawer on mobile via `open` state.

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiMessageSquare, FiFileText, FiHelpCircle, FiLayers,
  FiCalendar, FiCheckSquare, FiClipboard, FiUser, FiShield, FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/chat', label: 'AI Chat Assistant', icon: FiMessageSquare },
  { to: '/notes', label: 'Notes & Summarizer', icon: FiFileText },
  { to: '/quiz', label: 'Quiz Generator', icon: FiHelpCircle },
  { to: '/flashcards', label: 'Flashcards', icon: FiLayers },
  { to: '/planner', label: 'Study Planner', icon: FiCalendar },
  { to: '/attendance', label: 'Attendance', icon: FiCheckSquare },
  { to: '/assignments', label: 'Assignments', icon: FiClipboard },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 transform bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100">StudyMate</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500">
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <FiShield size={18} />
              Admin Panel
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
