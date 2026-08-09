// context/AuthContext.jsx
// Provides authentication state and authentication actions.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import toast from 'react-hot-toast';

import {
  loginApi,
  registerApi,
  verifyRegistrationOtpApi,
  forgotPasswordApi,
  verifyResetOtpApi,
  resetPasswordApi,
  getProfileApi,
  updateProfileApi,
} from '../api/authApi';


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // Restore existing login session
  useEffect(() => {

    const init = async () => {

      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {

        try {

          setUser(JSON.parse(savedUser));

          const res = await getProfileApi();

          setUser(res.data.data);

          localStorage.setItem(
            'user',
            JSON.stringify(res.data.data)
          );

        } catch (err) {

          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);

        }

      }

      setLoading(false);
    };

    init();

  }, []);


  // LOGIN
  const login = async (credentials) => {

    const res = await loginApi(credentials);

    const { token, ...userData } = res.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );

    setUser(userData);

    toast.success(`Welcome back, ${userData.name}! 👋`);

    return userData;
  };


  // REGISTER
  // IMPORTANT:
  // Registration no longer logs the user in.
  // Backend sends OTP to email instead.
  const register = async (payload) => {

    const res = await registerApi(payload);

    toast.success(
      'Registration successful! Check your email for the OTP. 📧'
    );

    return res.data;
  };


  // VERIFY REGISTRATION OTP
  const verifyRegistration = async (data) => {

    const res = await verifyRegistrationOtpApi(data);

    const { token, ...userData } = res.data.data;

    localStorage.setItem('token', token);

    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );

    setUser(userData);

    toast.success('Email verified successfully! 🎉');

    return userData;
  };


  // FORGOT PASSWORD
  const forgotPassword = async (data) => {

    const res = await forgotPasswordApi(data);

    toast.success(
      'If the email exists, an OTP has been sent. 📧'
    );

    return res.data;
  };


  // VERIFY RESET OTP
  const verifyResetOtp = async (data) => {

    const res = await verifyResetOtpApi(data);

    return res.data;
  };


  // RESET PASSWORD
  const resetPassword = async (data) => {

    const res = await resetPasswordApi(data);

    toast.success(
      'Password reset successfully! 🔐'
    );

    return res.data;
  };


  // LOGOUT
  const logout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);

    toast.success('Logged out successfully');

  };


  // UPDATE PROFILE
  const updateProfile = async (data) => {

    const res = await updateProfileApi(data);

    setUser(res.data.data);

    localStorage.setItem(
      'user',
      JSON.stringify(res.data.data)
    );

    toast.success('Profile updated');

    return res.data.data;
  };


  return (

    <AuthContext.Provider
      value={{
        user,
        loading,

        login,
        register,

        verifyRegistration,

        forgotPassword,
        verifyResetOtp,
        resetPassword,

        logout,
        updateProfile,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};


export const useAuth = () => {

  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
};