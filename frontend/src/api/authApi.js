import api from './axiosInstance';

// Registration
export const registerApi = (data) =>
  api.post('/auth/register', data);

export const verifyRegistrationOtpApi = (data) =>
  api.post('/auth/verify-registration', data);

export const resendOtpApi = (data) =>
  api.post('/auth/resend-otp', data);

export const verifyEmailApi = (data) =>
  api.post('/auth/verify-registration', data);

// Login
export const loginApi = (data) =>
  api.post('/auth/login', data);

// Forgot Password
export const forgotPasswordApi = (data) =>
  api.post('/auth/forgot-password', data);

export const verifyResetOtpApi = (data) =>
  api.post('/auth/verify-reset-otp', data);

export const resetPasswordApi = (data) =>
  api.post('/auth/reset-password', data);

// Profile
export const getProfileApi = () =>
  api.get('/auth/profile');

export const updateProfileApi = (data) =>
  api.put('/auth/profile', data);