import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, submissionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // questionIndex -> selectedAnswer
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    quizAPI.get(id)
      .then(({ data }) => {
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.timeLimit * 60);
        startTimeRef.current = Date.now();
      })
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qIdx, selected]) => ({
        questionIndex: parseInt(qIdx),
        selectedAnswer: selected,
      }));
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
      const { data } = await submissionAPI.submit({ quizId: id, answers: formattedAnswers, timeTaken });
      toast.success(auto ? 'Time up! Quiz auto-submitted' : 'Quiz submitted successfully!');
      navigate(`/student/quiz/${id}/result/${data.submission._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  }, [answers, id, navigate, submitting]);

  // Timer
  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, handleSubmit, timeLeft <= 0]);

  if (loading) return <LoadingSpinner size="lg" text="Preparing your quiz..." />;
  if (!quiz) return <div className="text-center py-12 text-slate-500">Quiz not found</div>;

  const questions = quiz.questions || [];
  const question = questions[current];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 60;

  const selectAnswer = (optionIdx) => {
    setAnswers(prev => ({ ...prev, [current]: optionIdx }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="card p-5 mb-5 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-bold text-slate-900 font-display">{quiz.title}</h1>
            <p className="text-xs text-slate-400">{quiz.subject} · Question {current + 1} of {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${
            isLowTime ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-primary-50 text-primary-700'
          }`}>
            <Clock size={15} />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">{answeredCount} of {questions.length} answered</p>
      </div>

      {/* Question */}
      <div className="card p-6 mb-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-primary-50 text-primary-600 text-xs">{question.topic}</span>
          <span className={`badge text-xs ${
            question.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
            question.difficulty === 'hard' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}>{question.difficulty}</span>
          <span className="text-xs text-slate-400 ml-auto">{question.points} pts</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-6 leading-relaxed">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((opt, idx) => (
            <button key={idx} onClick={() => selectAnswer(idx)}
              className={`quiz-option w-full text-left ${answers[current] === idx ? 'selected' : ''}`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                answers[current] === idx ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
              }`}>
                {answers[current] === idx && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
              <span className="text-sm text-slate-700">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="btn-secondary disabled:opacity-40">
          <ChevronLeft size={16} /> Previous
        </button>

        <div className="flex gap-1.5 overflow-x-auto max-w-xs">
          {questions.map((_, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)}
              className={`w-7 h-7 rounded-lg text-xs font-medium flex-shrink-0 transition-all ${
                idx === current ? 'bg-primary-600 text-white' :
                answers[idx] !== undefined ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-400'
              }`}>
              {idx + 1}
            </button>
          ))}
        </div>

        {current === questions.length - 1 ? (
          <button onClick={() => setShowConfirm(true)} className="btn-primary">
            <Flag size={16} /> Submit
          </button>
        ) : (
          <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} className="btn-primary">
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Confirm submit modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              {answeredCount < questions.length ? (
                <AlertTriangle className="text-amber-600" size={22} />
              ) : (
                <CheckCircle2 className="text-emerald-600" size={22} />
              )}
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Submit Quiz?</h3>
            <p className="text-sm text-slate-500 mb-5">
              You've answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && ' Unanswered questions will be marked incorrect.'}
              {' '}This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}