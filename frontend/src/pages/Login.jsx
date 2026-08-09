// pages/Login.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
  const errs = {};

  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errs.email = 'Enter a valid email address';
  }

  setErrors(errs);

  return Object.keys(errs).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Only validate email on the frontend first.
  // Password validation will happen after we know the email is valid.
  const errs = {};

  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errs.email = 'Enter a valid email address';
  }

  setErrors(errs);

  if (Object.keys(errs).length > 0) return;

  setLoading(true);

  try {
    await login(form);
    navigate('/dashboard');
  } catch (err) {
    // Backend error will be displayed here
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Login failed. Please try again.';

    setErrors({
      password: message,
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-8 transition-colors duration-200">

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-white text-xl font-bold">
            AI
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Log in to continue studying smarter
          </p>

        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
        >

          {/* Email */}
          <div>
            <label className="label">
              Email address
            </label>

            <div className="relative">

              <FiMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                size={17}
              />

              <input
                type="email"
                className="input-field !pl-12"
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

            </div>

            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>


          {/* Password */}
          <div>
            <label className="label">
              Password
            </label>

            <div className="relative">

              <FiLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                size={17}
              />

              <input
                type="password"
                className="input-field !pl-12"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

            </div>

            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 font-semibold hover:underline"
            >
              Forgot password?
            </Link>
          </div>


          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <FiLoader className="animate-spin" />
            ) : (
              'Log In'
            )}
          </button>

        </form>


        {/* Register Link */}
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">

          Don&apos;t have an account?{' '}

          <Link
            to="/register"
            className="text-primary-600 font-semibold hover:underline"
          >
            Sign up
          </Link>

        </p>

      </div>
    </div>
  );
};

export default Login;