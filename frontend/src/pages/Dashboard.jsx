// pages/Dashboard.jsx
// Daily Progress Dashboard: aggregated stats + Chart.js visualizations.

import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import {
  FiFileText, FiHelpCircle, FiLayers, FiCheckSquare, FiClipboard, FiMessageSquare,
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { getDashboardStatsApi } from '../api/dashboardApi';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardStatsApi();
        setStats(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <Loader full label="Loading your progress..." />
      </DashboardLayout>
    );
  }

  const attendanceChartData = {
    labels: stats.attendance.bySubject.map((s) => s.subject),
    datasets: [
      {
        label: 'Attendance %',
        data: stats.attendance.bySubject.map((s) => s.percent),
        backgroundColor: '#6366f1',
        borderRadius: 6,
      },
    ],
  };

  const taskDoughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.counts.completedStudyTasks, Math.max(stats.counts.studyTasks - stats.counts.completedStudyTasks, 0)],
        backgroundColor: ['#099220ce', '#FFC107'],
        borderWidth: 1,
      },
    ],
  };

  const quizTrendData = {
    labels: stats.quizTrend.map((q) => new Date(q.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Quiz Score %',
        data: stats.quizTrend.map((q) => q.score),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(99,102,241,0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Here&apos;s your study progress overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard icon={FiFileText} label="Notes" value={stats.counts.notes} color="indigo" />
        <StatCard icon={FiHelpCircle} label="Quizzes" value={stats.counts.quizzes} color="blue" />
        <StatCard icon={FiLayers} label="Flashcard Decks" value={stats.counts.flashcardDecks} color="pink" />
        <StatCard icon={FiMessageSquare} label="AI Chats" value={stats.counts.chats} color="green" />
        <StatCard icon={FiCheckSquare} label="Attendance" value={stats.attendance.percent} suffix="%" color="orange" />
        <StatCard icon={FiClipboard} label="Pending Tasks" value={stats.assignments.pending} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Quiz Score Trend</h3>
          {stats.quizTrend.length ? (
            <Line data={quizTrendData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">Attempt a quiz to see your trend here.</p>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Study Tasks</h3>
          {stats.counts.studyTasks ? (
            <Doughnut data={taskDoughnutData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">No study tasks yet.</p>
          )}
        </div>

        <div className="card lg:col-span-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Attendance by Subject</h3>
          {stats.attendance.bySubject.length ? (
            <Bar
              data={attendanceChartData}
              options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }}
            />
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">Mark attendance to see subject-wise stats.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
