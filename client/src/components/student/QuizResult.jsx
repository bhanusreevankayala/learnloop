import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissionAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, CheckCircle, XCircle, Clock, ArrowLeft, Award, TrendingDown, RotateCcw } from 'lucide-react';

export default function QuizResult() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionAPI.get(submissionId)
      .then(({ data }) => setSubmission(data.submission))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return <LoadingSpinner size="lg" text="Loading your results..." />;
  if (!submission) return <div className="text-center py-12 text-slate-500">Result not found</div>;

  const correct = submission.answers.filter(a => a.isCorrect).length;
  const incorrect = submission.answers.length - correct;
  const pieData = [
    { name: 'Correct', value: correct, color: '#10B981' },
    { name: 'Incorrect', value: incorrect, color: '#EF4444' },
  ];

  const scoreColor = submission.percentage >= 80 ? '#10B981' : submission.percentage >= 60 ? '#3B82F6' : submission.percentage >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link to="/student/quizzes" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Back to quizzes
      </Link>

      {/* Score header */}
      <div className="card p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: scoreColor, transform: 'translate(30%, -30%)' }} />

        {submission.passed ? (
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="text-emerald-600" size={28} />
          </div>
        ) : (
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="text-amber-600" size={28} />
          </div>
        )}

        <h1 className="text-4xl font-bold font-display mb-1" style={{ color: scoreColor }}>
          {submission.percentage}%
        </h1>
        <p className="text-slate-500 mb-4">{submission.quiz?.title}</p>

        <span className={`badge text-sm font-semibold ${submission.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {submission.passed ? '✓ Passed' : '✗ Not Passed'}
        </span>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <p className="text-2xl font-bold text-slate-900">{correct}/{submission.answers.length}</p>
            <p className="text-xs text-slate-400">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{submission.score}/{submission.totalPoints}</p>
            <p className="text-xs text-slate-400">Points</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{Math.floor(submission.timeTaken / 60)}m {submission.timeTaken % 60}s</p>
            <p className="text-xs text-slate-400">Time Taken</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="section-title mb-3">Answer Breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Correct ({correct})</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-2.5 h-2.5 rounded-full bg-red-500" />Incorrect ({incorrect})</span>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-3">Topic Performance</h3>
          <div className="space-y-3">
            {submission.topicScores?.map((ts, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{ts.topic}</span>
                  <span className="font-semibold text-slate-900">{ts.percentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="h-full rounded-full"
                    style={{ width: `${ts.percentage}%`, background: ts.percentage >= 60 ? '#10B981' : '#EF4444' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question review */}
      {submission.quiz?.allowReview && (
        <div className="card p-6">
          <h3 className="section-title mb-4">Review Answers</h3>
          <div className="space-y-4">
            {submission.answers.map((ans, idx) => {
              const fullQuestion = submission.quiz?.questions?.[idx];
              return (
                <div key={idx} className={`p-4 rounded-xl border-2 ${ans.isCorrect ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {ans.isCorrect ? <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">{idx + 1}. {ans.question}</p>
                      <span className="badge bg-slate-100 text-slate-500 text-xs mt-1">{ans.topic}</span>
                    </div>
                  </div>
                  {fullQuestion && (
                    <div className="ml-6 space-y-1.5 mt-2">
                      {fullQuestion.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`text-xs px-3 py-1.5 rounded-lg ${
                          oIdx === ans.correctAnswer ? 'bg-emerald-100 text-emerald-700 font-medium' :
                          oIdx === ans.selectedAnswer && !ans.isCorrect ? 'bg-red-100 text-red-700' :
                          'text-slate-500'
                        }`}>
                          {opt} {oIdx === ans.correctAnswer && '✓'} {oIdx === ans.selectedAnswer && oIdx !== ans.correctAnswer && '✗ Your answer'}
                        </div>
                      ))}
                      {fullQuestion.explanation && (
                        <p className="text-xs text-slate-500 italic mt-2 pl-1">💡 {fullQuestion.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Link to="/student/quizzes" className="btn-primary w-full justify-center">
        Back to Quizzes
      </Link>
    </div>
  );
}