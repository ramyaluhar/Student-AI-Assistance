// pages/Profile.jsx
// Student Profile: view/edit personal & academic info,
// profile picture with crop functionality, change password.

import React, { useEffect, useRef, useState } from 'react';
import {
  FiSave,
  FiUser,
  FiCamera,
  FiTrash2,
  FiMail,
  FiX,
  FiCheck,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi';

import Cropper from 'react-easy-crop';

import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';


// ============================================================
// CREATE CROPPED IMAGE
// ============================================================

const createCroppedImage = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const outputSize = 500;

      canvas.width = outputSize;
      canvas.height = outputSize;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputSize,
        outputSize
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    image.onerror = reject;

    image.src = imageSrc;
  });
};


// ============================================================
// PROFILE COMPONENT
// ============================================================

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const fileInputRef = useRef(null);

  // Profile form
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    semester: user?.semester || 1,
    password: '',
    avatar: user?.avatar || '',
  });

  // Saved/current preview
  const [preview, setPreview] = useState(user?.avatar || '');

  // Saving profile
  const [saving, setSaving] = useState(false);

  // ==========================================================
  // CROPPER STATES
  // ==========================================================

  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [cropping, setCropping] = useState(false);


  // ==========================================================
  // KEEP PROFILE DATA SYNCHRONIZED
  // ==========================================================

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,

        name: user.name || '',
        college: user.college || '',
        branch: user.branch || '',
        semester: user.semester || 1,
        avatar: user.avatar || '',
      }));

      setPreview(user.avatar || '');
    }
  }, [user]);


  // ==========================================================
  // IMAGE SELECTED
  // ==========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;


    // Check image type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }


    // Maximum original file size = 5 MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5 MB.');
      return;
    }


    const reader = new FileReader();

    reader.onloadend = () => {
      setCropImage(reader.result);

      // Reset crop position
      setCrop({
        x: 0,
        y: 0,
      });

      // Reset zoom
      setZoom(1);

      // Open cropper
      setCropping(true);
    };

    reader.readAsDataURL(file);
  };


  // ==========================================================
  // CROP COMPLETE
  // ==========================================================

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };


  // ==========================================================
  // APPLY CROP
  // ==========================================================

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) return;

    try {
      const croppedImage = await createCroppedImage(
        cropImage,
        croppedAreaPixels
      );

      // Update preview
      setPreview(croppedImage);

      // Update form
      setForm((prev) => ({
        ...prev,
        avatar: croppedImage,
      }));

      // Close cropper
      setCropping(false);

      setCropImage(null);

    } catch (error) {
      console.error('Crop failed:', error);
      alert('Unable to crop image. Please try again.');
    }
  };


  // ==========================================================
  // CANCEL CROP
  // ==========================================================

  const handleCropCancel = () => {
    setCropping(false);
    setCropImage(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  // ==========================================================
  // REMOVE PROFILE PICTURE
  // ==========================================================

  const handleRemoveImage = () => {
    setPreview('');

    setForm((prev) => ({
      ...prev,
      avatar: '',
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const { password, ...rest } = form;

      const payload = password
        ? {
            ...rest,
            password,
          }
        : rest;

      await updateProfile(payload);

      // Clear password field
      setForm((prev) => ({
        ...prev,
        password: '',
      }));

    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // INITIAL LETTER
  // ==========================================================

  const initial =
    user?.name?.charAt(0)?.toUpperCase() || 'U';


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <DashboardLayout>

      <div className="max-w-3xl mx-auto space-y-6">


        {/* ====================================================
            PROFILE HEADER
        ===================================================== */}

        <div className="card">

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">


            {/* PROFILE PICTURE */}

            <div className="relative">

              {preview ? (

                <img
                  src={preview}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                />

              ) : (

                <div className="w-28 h-28 rounded-full bg-primary-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
                  {initial}
                </div>

              )}


              {/* CAMERA BUTTON */}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition"
                title="Change profile picture"
              >
                <FiCamera size={16} />
              </button>


              {/* HIDDEN FILE INPUT */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

            </div>


            {/* USER INFORMATION */}

            <div className="text-center sm:text-left flex-1">

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name || 'Student'}
              </h2>


              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">

                <FiMail size={15} />

                <span>
                  {user?.email}
                </span>

              </div>


              <div className="mt-3">

                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 capitalize">
                  {user?.role || 'student'}
                </span>

              </div>


              {/* REMOVE IMAGE */}

              {preview && (

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
                >

                  <FiTrash2 size={14} />

                  Remove picture

                </button>

              )}


              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                JPG, PNG or other image formats • Maximum 5 MB
              </p>

            </div>

          </div>

        </div>


        {/* ====================================================
            EDIT PROFILE
        ===================================================== */}

        <div className="card">

          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">

            <FiUser size={17} />

            Edit Profile

          </h3>


          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >


            {/* FULL NAME */}

            <div>

              <label className="label">
                Full Name
              </label>

              <input
                className="input-field"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

            </div>


            {/* COLLEGE */}

            <div>

              <label className="label">
                College / Institute
              </label>

              <input
                className="input-field"
                value={form.college}
                onChange={(e) =>
                  setForm({
                    ...form,
                    college: e.target.value,
                  })
                }
              />

            </div>


            {/* BRANCH + SEMESTER */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


              <div>

                <label className="label">
                  Branch
                </label>

                <input
                  className="input-field"
                  value={form.branch}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      branch: e.target.value,
                    })
                  }
                />

              </div>


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

                  {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (semester) => (

                      <option
                        key={semester}
                        value={semester}
                      >
                        Semester {semester}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label className="label">
                New Password
              </label>

              <input
                type="password"
                className="input-field"
                placeholder="Leave blank to keep current password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

              <p className="text-xs text-gray-400 mt-1">
                Leave this blank if you don't want to change your password.
              </p>

            </div>


            {/* SAVE BUTTON */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >

                {saving ? (

                  <Loader size="sm" />

                ) : (

                  <>
                    <FiSave size={15} />
                    Save Changes
                  </>

                )}

              </button>

            </div>

          </form>

        </div>

      </div>


      {/* ======================================================
          CROPPER MODAL
      ======================================================= */}

      {cropping && cropImage && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">

          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">


            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">

              <div>

                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Adjust Profile Picture
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Move and zoom the image to choose the perfect crop.
                </p>

              </div>


              <button
                type="button"
                onClick={handleCropCancel}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <FiX size={20} />
              </button>

            </div>


            {/* CROPPER AREA */}

            <div className="relative w-full h-[350px] bg-black">

              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />

            </div>


            {/* ZOOM CONTROL */}

            <div className="px-6 pt-5">

              <div className="flex items-center gap-3">

                <FiZoomOut
                  size={18}
                  className="text-gray-500 shrink-0"
                />

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) =>
                    setZoom(Number(e.target.value))
                  }
                  className="w-full accent-primary-600"
                />

                <FiZoomIn
                  size={18}
                  className="text-gray-500 shrink-0"
                />

              </div>

              <p className="text-center text-xs text-gray-400 mt-2">
                Zoom: {zoom.toFixed(1)}x
              </p>

            </div>


            {/* MODAL BUTTONS */}

            <div className="flex justify-end gap-3 px-5 py-5">

              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >

                Cancel

              </button>


              <button
                type="button"
                onClick={handleCropSave}
                className="btn-primary"
              >

                <FiCheck size={16} />

                Apply Crop

              </button>

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
};

export default Profile;