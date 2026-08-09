import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiLock,
  FiKey,
  FiLoader,
  FiArrowLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import {
  forgotPasswordApi,
  verifyResetOtpApi,
  resetPasswordApi,
} from '../api/authApi';

import ThemeToggle from '../components/ThemeToggle';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});

  // ============================================================
  // STEP 1 — SEND OTP
  // ============================================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setErrors({
        email: 'Enter a valid email address',
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await forgotPasswordApi({
        email: trimmedEmail,
      });

      toast.success('OTP sent to your email 📧');
      setStep(2);
    } catch (err) {
      // Error is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 2 — VERIFY OTP
  // ============================================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({
        otp: 'Enter the 6-digit OTP',
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await verifyResetOtpApi({
        email: email.trim(),
        otp: otp.trim(),
      });

      toast.success('OTP verified successfully ✅');
      setStep(3);
    } catch (err) {
      // Error is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 3 — RESET PASSWORD
  // ============================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const errs = {};

    if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);

    if (Object.keys(errs).length !== 0) {
      return;
    }

    setLoading(true);

    try {
      await resetPasswordApi({
        email: email.trim(),
        otp: otp.trim(),
        password,
      });

      toast.success('Password reset successfully! 🎉');

      navigate('/login');
    } catch (err) {
      // Error is handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950 relative">

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-white">
            {step === 1 && <FiMail size={24} />}
            {step === 2 && <FiKey size={24} />}
            {step === 3 && <FiLock size={24} />}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 1 && 'Forgot your password?'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'Create new password'}
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {step === 1 &&
              'Enter your email and we will send you a verification code.'}

            {step === 2 &&
              'Enter the 6-digit OTP sent to your email.'}

            {step === 3 &&
              'Choose a new password for your account.'}
          </p>

        </div>


        {/* =====================================================
            STEP 1 — EMAIL
        ====================================================== */}

        {step === 1 && (
          <form
            onSubmit={handleSendOtp}
            className="space-y-4"
            noValidate
          >

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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                  }}
                  autoFocus
                />

              </div>

              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>


            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <FiLoader className="animate-spin" />
              ) : (
                'Send OTP'
              )}
            </button>

          </form>
        )}


        {/* =====================================================
            STEP 2 — OTP
        ====================================================== */}

        {step === 2 && (
          <form
            onSubmit={handleVerifyOtp}
            className="space-y-4"
            noValidate
          >

            <div>
              <label className="label">
                Verification Code
              </label>

              <div className="relative">

                <FiKey
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                  size={17}
                />

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="input-field !pl-12 tracking-[0.35em]"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6);

                    setOtp(value);
                    setErrors({});
                  }}
                  autoFocus
                />

              </div>

              {errors.otp && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.otp}
                </p>
              )}
            </div>


            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <FiLoader className="animate-spin" />
              ) : (
                'Verify OTP'
              )}
            </button>


            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setErrors({});
              }}
              className="w-full text-sm text-gray-500 hover:text-primary-600"
            >
              Change email
            </button>

          </form>
        )}


        {/* =====================================================
            STEP 3 — NEW PASSWORD
        ====================================================== */}

        {step === 3 && (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
            noValidate
          >

            {/* New Password */}
            <div>
              <label className="label">
                New Password
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                  }}
                  autoFocus
                />

              </div>

              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password}
                </p>
              )}
            </div>


            {/* Confirm Password */}
            <div>
              <label className="label">
                Confirm New Password
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
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({});
                  }}
                />

              </div>

              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>


            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <FiLoader className="animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>

          </form>
        )}


        {/* Back to Login */}
        <div className="text-center mt-6">

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline"
          >
            <FiArrowLeft size={15} />
            Back to Login
          </Link>

        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;