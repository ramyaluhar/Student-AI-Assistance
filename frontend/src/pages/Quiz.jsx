// pages/Quiz.jsx
// AI Quiz Generator: create quizzes from notes or a topic, list past quizzes.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiZap, FiHelpCircle, FiTrash2, FiPlay } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { generateQuizApi, getQuizzesApi, deleteQuizApi } from '../api/quizApi';
import { getNotesApi } from '../api/noteApi';

const Quiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ source: 'topic', noteId: '', topic: '', difficulty: 'medium', count: 5, customCount: '' });

  const loadData = async () => {
    const [quizRes, noteRes] = await Promise.all([getQuizzesApi(), getNotesApi()]);
    setQuizzes(quizRes.data.data);
    setNotes(noteRes.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (form.source === 'topic' && !form.topic.trim()) return toast.error('Please enter a topic');
    if (form.source === 'note' && !form.noteId) return toast.error('Please select a note');

    setGenerating(true);
    try {
      const finalCount =
  form.count === 'custom'
    ? Number(form.customCount)
    : Number(form.count);

if (!finalCount || finalCount < 1 || finalCount > 50) {
  return toast.error('Please enter a number between 1 and 50');
}
      const payload = {
        difficulty: form.difficulty,
        count: finalCount,
        ...(form.source === 'note' ? { noteId: form.noteId } : { topic: form.topic }),
      };
      const res = await generateQuizApi(payload);
      toast.success('Quiz generated!');
      navigate(`/quiz/${res.data.data._id}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    await deleteQuizApi(id);
    toast.success('Quiz deleted');
    loadData();
  };

  return (
    <DashboardLayout title="Quiz Generator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-1 h-fit">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Generate New Quiz</h3>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({ ...form, source: 'topic' })}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg ${form.source === 'topic' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                From Topic
              </button>
              <button type="button" onClick={() => setForm({ ...form, source: 'note' })}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg ${form.source === 'note' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                From Note
              </button>
            </div>

            {form.source === 'topic' ? (
              <div>
                <label className="label">Topic</label>
                <input className="input-field" placeholder="e.g. Operating System Deadlocks" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
              </div>
            ) : (
              <div>
                <label className="label">Select Note</label>
                <select className="input-field" value={form.noteId} onChange={(e) => setForm({ ...form, noteId: e.target.value })}>
                  <option value="">Choose a note...</option>
                  {notes.map((n) => <option key={n._id} value={n._id}>{n.title}</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Difficulty</label>
                <select className="input-field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
  <label className="label"># Questions</label>

  <select
    className="input-field"
    value={form.count === 'custom' ? 'custom' : form.count}
    onChange={(e) =>
      setForm({
        ...form,
        count: e.target.value === 'custom' ? 'custom' : Number(e.target.value),
      })
    }
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={15}>15</option>
    <option value="custom">Custom</option>
  </select>

  {form.count === 'custom' && (
    <input
      type="number"
      min="1"
      max="50"
      className="input-field mt-2"
      placeholder="Enter number of questions"
      value={form.customCount || ''}
      onChange={(e) =>
        setForm({
          ...form,
          customCount: e.target.value,
        })
      }
    />
  )}
</div>
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full">
              {generating ? <Loader size="sm" label="Generating with AI..." /> : <><FiZap size={16} /> Generate Quiz</>}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Your Quizzes</h3>
          {loading ? (
            <Loader />
          ) : quizzes.length === 0 ? (
            <EmptyState icon={FiHelpCircle} title="No quizzes yet" description="Generate your first AI quiz using the form." />
          ) : (
            <div className="space-y-2">
              {quizzes.map((q) => (
                <div key={q._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{q.topic}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {q.difficulty} • {q.questions.length} questions
                      {q.lastScore !== null && ` • Last score: ${q.lastScore}%`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/quiz/${q._id}`)} className="btn-secondary text-xs !px-3 !py-1.5">
                      <FiPlay size={13} /> Attempt
                    </button>
                    <FiTrash2 size={15} className="text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => handleDelete(q._id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Quiz;
