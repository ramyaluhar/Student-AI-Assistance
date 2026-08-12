import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiLock,
  FiLoader,
  FiBookOpen,
  FiShield,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import { registerApi, verifyEmailApi, resendOtpApi } from '../api/authApi';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('register');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    branch: '',
    semester: 1,
  });

  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = 'Name is required';
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }

    if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // ===============================
  // SEND REGISTRATION OTP
  // ===============================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = form;

      await registerApi(payload);

      toast.success('OTP sent to your email 📧');

      setStep('otp');
    } catch (err) {
      // Axios interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // VERIFY OTP
  // ===============================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyEmailApi({
        email: form.email,
        otp,
      });

      const data = res.data.data;

      const { token, ...userData } = data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Email verified! Account created 🎉');

      navigate('/dashboard');
    } catch (err) {
      // Axios interceptor handles error toast
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RESEND OTP
  // ===============================

  const handleResendOtp = async () => {
    setResending(true);

    try {
      await resendOtpApi({
        email: form.email,
      });

      toast.success('New OTP sent 📧');
      setOtp('');
    } catch (err) {
      // Axios interceptor handles error toast
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-950">

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl">

        {/* ===============================
            OTP SCREEN
        =============================== */}

        {step === 'otp' ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-white">
                <FiShield size={25} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verify your email
              </h1>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                We sent a 6-digit OTP to
              </p>

              <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200 break-all">
                {form.email}
              </p>

            </div>

            {/* OTP Form */}
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-5"
            >

              <div>
                <label className="label">
                  Enter OTP
                </label>

                <div className="relative">

                  <FiShield
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                    size={17}
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    className="input-field !pl-12 text-center tracking-[0.5em] font-semibold text-lg"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ''))
                    }
                  />

                </div>

                <p className="text-xs text-gray-400 mt-2 text-center">
                  OTP expires in 10 minutes
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  'Verify Email'
                )}
              </button>

            </form>

            {/* Resend */}
            <div className="text-center mt-5">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive the OTP?
              </p>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="mt-1 text-primary-600 font-semibold hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>

            </div>

            {/* Back */}
            <button
              type="button"
              onClick={() => {
                setStep('register');
                setOtp('');
              }}
              className="flex items-center justify-center gap-2 mx-auto mt-6 text-sm text-gray-500 hover:text-primary-600"
            >
              <FiArrowLeft size={15} />
              Back to registration
            </button>
          </>
        ) : (

          /* ===============================
             REGISTRATION SCREEN
          =============================== */

          <>
            {/* Header */}
            <div className="text-center mb-8">

              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-xl bg-primary-600 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Assist AI"
                  className="h-full w-full object-cover object-center"
                />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create your account
              </h1>

              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Start studying smarter with AI
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleRegister}
              className="space-y-4"
              noValidate
            >

              {/* Full Name */}
              <div>
                <label className="label">
                  Full Name
                </label>

                <div className="relative">

                  <FiUser
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                    size={17}
                  />

                  <input
                    type="text"
                    className="input-field !pl-12"
                    placeholder="Jay Patel"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />

                </div>

                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

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

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

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

                {/* Confirm */}
                <div>

                  <label className="label">
                    Confirm
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
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirmPassword: e.target.value,
                        })
                      }
                    />

                  </div>

                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}

                </div>

              </div>

              {/* College */}
              <div>

                <label className="label">
                  College / Institute
                </label>

                <div className="relative">

                  <FiBookOpen
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                    size={17}
                  />

                  <input
                    type="text"
                    className="input-field !pl-12"
                    placeholder="e.g. LDCE, Ahmedabad"
                    value={form.college}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        college: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {/* Branch + Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Branch */}
                <div>

                  <label className="label">
                    Branch
                  </label>

                  <input
                    type="text"
                    className="input-field"
                    placeholder="Computer Engg"
                    value={form.branch}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        branch: e.target.value,
                      })
                    }
                  />

                </div>

                {/* Semester */}
                <div>

                  <label className="label">
                    Semester
                  </label>

                  <select
                    className="input-field"
                    value={form.semester}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        semester: Number(e.target.value),
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

                    {/* Terms & Privacy Agreement */}
<div className="flex items-start gap-2 mt-4">
  <input
    type="checkbox"
    id="terms"
    checked={agreedToTerms}
    onChange={(e) => setAgreedToTerms(e.target.checked)}
    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
  />

  <label
    htmlFor="terms"
    className="text-sm text-gray-500 dark:text-gray-400 leading-5 cursor-pointer"
  >
    By signing up, I confirm that I have read and agree to the{' '}
    
    <Link
      to="/terms"
      target="_blank"
      className="text-primary-600 font-medium hover:underline"
    >
      Terms of Service
    </Link>
    
    {' '}and{' '}
    
    <Link
      to="/privacy"
      target="_blank"
      className="text-primary-600 font-medium hover:underline"
    >
      Privacy Policy
    </Link>
    .
  </label>
</div>


              {/* Create Account */}
              <button
  type="submit"
  disabled={loading || !agreedToTerms}
  className={`btn-primary w-full ${
    !agreedToTerms
      ? 'opacity-50 cursor-not-allowed'
      : ''
  }`}
>
                {loading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>

            </form>

            {/* Login Link */}
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">

              Already have an account?{' '}

              <Link
                to="/login"
                className="text-primary-600 font-semibold hover:underline"
              >
                Log in
              </Link>

            </p>

            {/* Developer Credit */}
            <div className="mt-10 text-center">

              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                Built & Designed by
              </p>

              <div className="flex items-center justify-center gap-6">

                {/* Ramya */}
                <div className="flex flex-col items-center">

                  <img
                    src="/ramya-photo.png"
                    alt="Ramya Chitroda"
                    className="w-24 h-24 object-contain"
                  />

                  <span className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Ramya Chitroda
                  </span>

                </div>

                <span className="text-gray-300 dark:text-gray-700">
                  ×
                </span>

                {/* Jay */}
                <div className="flex flex-col items-center">

                  <img
                    src="/jay-photo.png"
                    alt="Jay Makwana"
                    className="w-24 h-24 object-contain"
                  />

                  <span className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Jay Makwana
                  </span>

                </div>

              </div>

              <p className="mt-4 text-[11px] text-gray-400 dark:text-gray-600">
                © 2026 Assist AI · All Rights Reserved
              </p>

            </div>

          </>
        )}

      </div>
    </div>
  );
};

export default Register;