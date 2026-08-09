// components/Navbar.jsx
// Top app bar: hamburger menu, page title, theme toggle, user menu.

import React, { useState } from 'react';
import {
  FiMenu,
  FiLogOut,
  FiChevronDown,
  FiUser,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ onMenuClick, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const initial =
    user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sm:px-6 relative z-50">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <FiMenu size={21} />
        </button>

        {/* Page Title */}
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
          {title}
        </h1>

      </div>


      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle */}
        <ThemeToggle />


        {/* User Menu */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >

            {/* Profile Picture / Initial */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover border border-gray-300 dark:border-gray-700"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-semibold text-sm">
                {initial}
              </div>
            )}

            {/* Name */}
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.name || 'User'}
            </span>

            <FiChevronDown
              size={14}
              className="text-gray-400"
            />

          </button>


          {/* DROPDOWN */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">

              {/* Profile */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <FiUser size={16} />
                <span>Profile</span>
              </button>


              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800" />


              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
};

export default Navbar;