import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classAPI, quizAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { Plus, Trash2, ArrowLeft, Save, Send, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyQuestion = () => ({
  question: '', options: ['', '', '', ''], correctAnswer: 0,
  topic: '', difficulty: 'medium', points: 10, explanation: '',
});

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [saving, setSaving] = useState(false);

  const [meta, setMeta] = useState({
    title: '', description: '', classId: '', subject: '', timeLimit: 30,
    passingScore: 60, dueDate: '', maxAttempts: 1, allowReview: true, shuffleQuestions: false,
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);

  useEffect(() => {
    classAPI.getAll()
      .then(({ data }) => setClasses(data.classes || []))
      .catch(console.error)
      .finally(() => setLoadingClasses(false));
  }, []);

  const updateMeta = (field, value) => setMeta(p => ({ ...p, [field]: value }));

  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[optIdx] = value;
      return { ...q, options };
    }));
  };

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);
  const removeQuestion = (idx) => setQuestions(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!meta.title || !meta.classId || !meta.subject) {
      toast.error('Please fill in quiz title, class, and subject');
      return false;
    }
    for (const [i, q] of questions.entries()) {
      if (!q.question.trim()) { toast.error(`Question ${i + 1} is empty`); return false; }
      if (q.options.some(o => !o.trim())) { toast.error(`Question ${i + 1} has empty options`); return false; }
      if (!q.topic.trim()) { toast.error(`Question ${i + 1} needs a topic`); return false; }
    }
    return true;
  };

  const handleSave = async (publish = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...meta, questions, dueDate: meta.dueDate || undefined };
      const { data } = await quizAPI.create(payload);
      if (publish) {
        await quizAPI.publish(data.quiz._id);
        toast.success('Quiz created and published!');
      } else {
        toast.success('Quiz saved as draft');
      }
      navigate('/teacher/quizzes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loadingClasses) return <LoadingSpinner size="lg" text="Loading..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <button onClick={() => navigate('/teacher/quizzes')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={14} /> Back to quizzes
      </button>

      <div>
        <h1 className="page-title">Create New Quiz</h1>
        <p className="text-slate-500 mt-1">Build a multiple-choice quiz for your class</p>
      </div>

      {/* Quiz Meta */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title mb-2">Quiz Details</h2>
        <div>
          <label className="label">Quiz Title</label>
          <input value={meta.title} onChange={e => updateMeta('title', e.target.value)} className="input" placeholder="e.g. Algebra Fundamentals - Chapter 1" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea value={meta.description} onChange={e => updateMeta('description', e.target.value)} className="input resize-none" rows={2} placeholder="What this quiz covers..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Class</label>
            <select value={meta.classId} onChange={e => {
              updateMeta('classId', e.target.value);
              const cls = classes.find(c => c._id === e.target.value);
              if (cls) updateMeta('subject', cls.subject);
            }} className="input">
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <input value={meta.subject} onChange={e => updateMeta('subject', e.target.value)} className="input" placeholder="Mathematics" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Time Limit (min)</label>
            <input type="number" value={meta.timeLimit} onChange={e => updateMeta('timeLimit', +e.target.value)} className="input" min={5} />
          </div>
          <div>
            <label className="label">Passing Score (%)</label>
            <input type="number" value={meta.passingScore} onChange={e => updateMeta('passingScore', +e.target.value)} className="input" min={0} max={100} />
          </div>
          <div>
            <label className="label">Max Attempts</label>
            <input type="number" value={meta.maxAttempts} onChange={e => updateMeta('maxAttempts', +e.target.value)} className="input" min={1} />
          </div>
        </div>
        <div>
          <label className="label">Due Date (optional)</label>
          <input type="datetime-local" value={meta.dueDate} onChange={e => updateMeta('dueDate', e.target.value)} className="input" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={meta.allowReview} onChange={e => updateMeta('allowReview', e.target.checked)} className="rounded" />
            Allow answer review
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={meta.shuffleQuestions} onChange={e => updateMeta('shuffleQuestions', e.target.checked)} className="rounded" />
            Shuffle questions
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Questions ({questions.length})</h2>
        </div>

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="card p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="badge bg-primary-50 text-primary-600">Question {qIdx + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qIdx)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div>
              <label className="label">Question Text</label>
              <textarea value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                className="input resize-none" rows={2} placeholder="Enter your question..." />
            </div>

            <div>
              <label className="label">Options (select the correct answer)</label>
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <button onClick={() => updateQuestion(qIdx, 'correctAnswer', optIdx)}
                      className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        q.correctAnswer === optIdx ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                      }`}>
                      {q.correctAnswer === optIdx && <span className="text-white text-xs">✓</span>}
                    </button>
                    <input value={opt} onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                      className="input flex-1" placeholder={`Option ${optIdx + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Topic</label>
                <input value={q.topic} onChange={e => updateQuestion(qIdx, 'topic', e.target.value)} className="input" placeholder="e.g. Algebra" />
              </div>
              <div>
                <label className="label">Difficulty</label>
                <select value={q.difficulty} onChange={e => updateQuestion(qIdx, 'difficulty', e.target.value)} className="input">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="label">Points</label>
                <input type="number" value={q.points} onChange={e => updateQuestion(qIdx, 'points', +e.target.value)} className="input" min={1} />
              </div>
            </div>

            <div>
              <label className="label">Explanation (optional)</label>
              <input value={q.explanation} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)} className="input" placeholder="Explain the correct answer..." />
            </div>
          </div>
        ))}

        <button onClick={addQuestion} className="btn-secondary w-full justify-center">
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-lg">
        <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary flex-1">
          <Save size={16} /> Save as Draft
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex-1">
          <Send size={16} /> {saving ? 'Publishing...' : 'Publish Quiz'}
        </button>
      </div>
    </div>
  );
}