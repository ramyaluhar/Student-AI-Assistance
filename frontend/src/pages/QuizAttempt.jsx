// pages/QuizAttempt.jsx
// Renders a single quiz for the student to attempt, then shows scored results.

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import { getQuizByIdApi, submitQuizApi } from '../api/quizApi';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await getQuizByIdApi(id);
      setQuiz(res.data.data);
      setAnswers(new Array(res.data.data.questions.length).fill(null));
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSelect = (qIdx, option) => {
    if (result) return;
    const copy = [...answers];
    copy[qIdx] = option;
    setAnswers(copy);
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) {
      return toast.error('Please answer all questions before submitting');
    }
    setSubmitting(true);
    try {
      const res = await submitQuizApi(id, answers);
      setResult(res.data.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DashboardLayout title="Quiz"><Loader full /></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Quiz Attempt">
      <button onClick={() => navigate('/quiz')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <FiArrowLeft size={15} /> Back to Quizzes
      </button>

      <div className="card mb-5">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">{quiz.topic}</h2>
        <p className="text-sm text-gray-400 capitalize">{quiz.difficulty} difficulty • {quiz.questions.length} questions</p>
        {result && (
          <div className="mt-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{result.score}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{result.correctCount} / {result.total} correct</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {quiz.questions.map((q, idx) => {
          const breakdown = result?.breakdown[idx];
          return (
            <div key={idx} className="card">
              <p className="font-medium text-gray-800 dark:text-gray-100 mb-3">
                {idx + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt) => {
                  const isSelected = answers[idx] === opt;
                 let stateClasses = 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-primary-400';

                  if (result) {
                    if (opt === breakdown.correctAnswer) {
                      stateClasses =
                        'border-green-500 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-100';
                    } else if (isSelected && !breakdown.isCorrect) {
                      stateClasses =
                        'border-red-500 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-100';
                    }
                  } else if (isSelected) {
                    stateClasses =
                      'border-primary-500 bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white';
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(idx, opt)}
                      className={`text-left text-sm px-4 py-2.5 rounded-xl border transition-colors ${stateClasses}`}
                    >
                      <span className="flex items-center justify-between">
                        {opt}
                        {result && opt === breakdown.correctAnswer && <FiCheckCircle className="text-green-600" size={16} />}
                        {result && isSelected && !breakdown.isCorrect && opt !== breakdown.correctAnswer && <FiXCircle className="text-red-600" size={16} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {result && breakdown.explanation && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  💡 {breakdown.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!result && (
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full mt-5">
          {submitting ? <Loader size="sm" /> : 'Submit Quiz'}
        </button>
      )}
    </DashboardLayout>
  );
};

export default QuizAttempt;
