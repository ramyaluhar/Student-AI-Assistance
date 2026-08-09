// pages/Attendance.jsx
// Attendance Tracker: mark attendance for multiple subjects on one date.

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiCheckSquare,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiAlertTriangle,
} from 'react-icons/fi';

import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

import {
  markAttendanceApi,
  getAttendanceApi,
  getAttendanceSummaryApi,
} from '../api/attendanceApi';


// Get today's date in YYYY-MM-DD format
const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


// Convert YYYY-MM-DD → DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-');

  if (!year || !month || !day) return dateString;

  return `${day}/${month}/${year}`;
};


// Convert database date → DD/MM/YYYY
const formatRecordDate = (dateValue) => {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};


const Attendance = () => {
  const [summary, setSummary] = useState([]);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dateInputRef = useRef(null);

  // Starts with exactly ONE subject
  const [form, setForm] = useState({
    date: getToday(),
    subjects: [
      {
        subject: '',
        status: 'present',
      },
    ],
  });


  // Load attendance data
  const loadData = async () => {
    try {
      const [summaryRes, recordsRes] = await Promise.all([
        getAttendanceSummaryApi(),
        getAttendanceApi(),
      ]);

      setSummary(summaryRes.data.data);
      setRecords(recordsRes.data.data.slice(0, 15));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to load attendance'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // Change selected date
  const handleDateChange = (e) => {
    setForm((prev) => ({
      ...prev,
      date: e.target.value,
    }));
  };


  // Change subject name
  const handleSubjectChange = (index, value) => {
    setForm((prev) => {
      const updatedSubjects = [...prev.subjects];

      updatedSubjects[index] = {
        ...updatedSubjects[index],
        subject: value,
      };

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };


  // Change Present / Absent
  const handleStatusChange = (index, status) => {
    setForm((prev) => {
      const updatedSubjects = [...prev.subjects];

      updatedSubjects[index] = {
        ...updatedSubjects[index],
        status,
      };

      return {
        ...prev,
        subjects: updatedSubjects,
      };
    });
  };


  // Add another subject
  const addSubject = () => {
    setForm((prev) => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        {
          subject: '',
          status: 'present',
        },
      ],
    }));
  };


  // Remove subject
  const removeSubject = (index) => {
    // Always keep at least one subject
    if (form.subjects.length === 1) {
      toast.error('At least one subject is required');
      return;
    }

    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };


  // Save all subjects for selected date
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check empty subjects
    const hasEmptySubject = form.subjects.some(
      (item) => !item.subject.trim()
    );

    if (hasEmptySubject) {
      toast.error('Please enter all subject names');
      return;
    }


    // Check duplicate subjects
    const subjectNames = form.subjects.map((item) =>
      item.subject.trim().toLowerCase()
    );

    const hasDuplicates =
      new Set(subjectNames).size !== subjectNames.length;

    if (hasDuplicates) {
      toast.error('Please do not add the same subject twice');
      return;
    }


    setSaving(true);

    try {
      // Save all subjects
      await Promise.all(
        form.subjects.map((item) =>
          markAttendanceApi({
            subject: item.subject.trim(),
            date: form.date,
            status: item.status,
          })
        )
      );

      toast.success('Attendance saved successfully');


      // Keep selected date, reset subjects to ONE
      setForm((prev) => ({
        ...prev,
        subjects: [
          {
            subject: '',
            status: 'present',
          },
        ],
      }));

      await loadData();

    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to save attendance'
      );
    } finally {
      setSaving(false);
    }
  };


  return (
    <DashboardLayout>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* =========================
            LEFT SIDE - MARK ATTENDANCE
        ========================== */}

        <div className="card">

          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-5">
            Mark Attendance
          </h2>


          <form onSubmit={handleSubmit}>

            {/* DATE */}
            <div className="mb-5">

              <label className="label">
                Date
              </label>

              <div className="relative">

                {/* Visible formatted date */}
                <div
                  className="
                    input-field
                    flex
                    items-center
                    justify-between
                    cursor-pointer
                    pr-12
                  "
                >
                  <span>
                    {formatDate(form.date)}
                  </span>

                  <FiCalendar
                    size={18}
                    className="text-gray-400"
                  />
                </div>


                {/* Real date picker */}
                <input
                  ref={dateInputRef}
                  type="date"
                  value={form.date}
                  onChange={handleDateChange}
                  aria-label="Select attendance date"
                  className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    opacity-0
                    cursor-pointer
                  "
                />

              </div>

              <p className="text-xs text-gray-400 mt-1">
                Format: DD/MM/YYYY
              </p>

            </div>


            {/* SUBJECTS */}

            <div className="space-y-4">

              {form.subjects.map((item, index) => (

                <div
                  key={index}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    dark:border-gray-700
                    p-4
                  "
                >

                  {/* Subject heading + delete */}
                  <div className="flex items-center justify-between mb-3">

                    <label className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                      Subject {index + 1}
                    </label>

                    {form.subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="text-gray-400 hover:text-red-500"
                        title="Remove subject"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    )}

                  </div>


                  {/* Subject input */}
                  <input
                    type="text"
                    className="input-field mb-3"
                    placeholder="e.g. Python"
                    value={item.subject}
                    onChange={(e) =>
                      handleSubjectChange(index, e.target.value)
                    }
                  />


                  {/* Present / Absent */}
                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(index, 'present')
                      }
                      className={`
                        flex-1
                        text-sm
                        font-semibold
                        py-2.5
                        rounded-xl
                        transition
                        ${
                          item.status === 'present'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }
                      `}
                    >
                      Present
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(index, 'absent')
                      }
                      className={`
                        flex-1
                        text-sm
                        font-semibold
                        py-2.5
                        rounded-xl
                        transition
                        ${
                          item.status === 'absent'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }
                      `}
                    >
                      Absent
                    </button>

                  </div>

                </div>

              ))}

            </div>


            {/* ADD SUBJECT */}

            <button
              type="button"
              onClick={addSubject}
              className="
                w-full
                mt-4
                py-2.5
                rounded-xl
                border
                border-dashed
                border-gray-300
                dark:border-gray-700
                text-sm
                font-semibold
                text-gray-600
                dark:text-gray-300
                hover:bg-gray-50
                dark:hover:bg-gray-800
                transition
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <FiPlus size={16} />
              Add Subject
            </button>


            {/* SAVE */}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full mt-4"
            >
              {saving ? (
                <Loader size="sm" label="Saving..." />
              ) : (
                <>
                  <FiCheckSquare size={16} />
                  Save Attendance
                </>
              )}
            </button>

          </form>

        </div>


        {/* =========================
            RIGHT SIDE
        ========================== */}

        <div className="lg:col-span-2 space-y-5">


          {/* SUBJECT-WISE ATTENDANCE */}

          <div className="card">

            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">
              Subject-wise Attendance
            </h3>


            {loading ? (
              <Loader />

            ) : summary.length === 0 ? (

              <EmptyState
                icon={FiCheckSquare}
                title="No attendance records"
                description="Start marking attendance to see your stats here."
              />

            ) : (

              <div className="space-y-5">

                {summary.map((s) => (

                  <div key={s.subject}>

                    <div className="flex justify-between text-sm mb-1">

                      <span className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">

                        {s.subject}

                        {s.percentage < 75 && (
                          <FiAlertTriangle
                            className="text-amber-500"
                            size={13}
                            title="Below 75%"
                          />
                        )}

                      </span>


                      <span
                        className={`font-semibold ${
                          s.percentage < 75
                            ? 'text-red-500'
                            : 'text-green-600'
                        }`}
                      >
                        {s.percentage}%
                      </span>

                    </div>


                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">

                      <div
                        className={`h-full rounded-full ${
                          s.percentage < 75
                            ? 'bg-red-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${s.percentage}%`,
                        }}
                      />

                    </div>


                    <p className="text-xs text-gray-400 mt-1">
                      {s.present} / {s.total} classes attended
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* RECENT RECORDS */}

          <div className="card">

            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Recent Records
            </h3>


            {records.length === 0 ? (

              <p className="text-xs text-gray-400">
                No records yet.
              </p>

            ) : (

              <div className="space-y-2">

                {records.map((r) => (

                  <div
                    key={r._id}
                    className="
                      flex
                      items-center
                      justify-between
                      text-sm
                      py-2
                      border-b
                      border-gray-50
                      dark:border-gray-800
                      last:border-0
                      gap-3
                    "
                  >

                    <span className="text-gray-700 dark:text-gray-200 flex-1">
                      {r.subject}
                    </span>


                    <span className="text-gray-400 whitespace-nowrap">
                      {formatRecordDate(r.date)}
                    </span>


                    <span
                      className={`
                        px-2
                        py-0.5
                        rounded-full
                        text-xs
                        font-medium
                        capitalize
                        whitespace-nowrap
                        ${
                          r.status === 'present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      `}
                    >
                      {r.status}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
};

export default Attendance;