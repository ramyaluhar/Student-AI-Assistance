// pages/Landing.jsx
// Public marketing/landing page shown before login.

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMessageSquare, FiFileText, FiHelpCircle, FiLayers, FiCalendar,
  FiCheckSquare, FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  { icon: FiMessageSquare, title: 'AI Chat Assistant', desc: 'Ask doubts anytime, get instant clear explanations.' },
  { icon: FiFileText, title: 'Notes Summarizer', desc: 'Upload PDF notes and get AI-generated summaries.' },
  { icon: FiHelpCircle, title: 'Quiz Generator', desc: 'Auto-generate MCQ quizzes from your own notes.' },
  { icon: FiLayers, title: 'Flashcards', desc: 'AI-built flashcard decks for quick revision.' },
  { icon: FiCalendar, title: 'Study Planner', desc: 'Smart weekly plans tailored to your exam dates.' },
  { icon: FiCheckSquare, title: 'Attendance & Assignments', desc: 'Track attendance % and never miss a deadline.' },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
      <header className="flex items-center justify-between px-6 lg:px-12 h-20">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <span className="font-bold text-lg text-gray-800 dark:text-gray-100">StudyMate</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </header>

      <section className="px-6 lg:px-12 pt-16 pb-20 text-center max-w-3xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-5">
          Powered by Google Gemini AI
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
          Your AI-Powered <span className="text-primary-600">Student Assistant</span>
        </h1>
        <p className="mt-5 text-lg text-gray-600 dark:text-gray-400">
          Summarize notes, generate quizzes and flashcards, plan your study schedule, and track your
          progress — all in one clean, distraction-free workspace.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to={user ? '/dashboard' : '/register'} className="btn-primary text-base px-6 py-3">
            {user ? 'Open Dashboard' : 'Start for Free'} <FiArrowRight />
          </Link>
        </div>
      </section>

      <section className="px-6 lg:px-12 pb-24 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="h-11 w-11 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 flex items-center justify-center mb-4">
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-sm text-gray-400 dark:text-gray-600 pb-8">
        Built for GTU BE Semester 7 Mini Project · AI Powered Student Assistant
      </footer>
    </div>
  );
};

export default Landing;
