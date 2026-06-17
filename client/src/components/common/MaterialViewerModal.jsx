import React from 'react';
import { X, Download, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function MaterialViewerModal({ material, onClose }) {
  if (!material) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 font-display">{material.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge bg-primary-50 text-primary-600 text-xs">{material.subject}</span>
              {material.topic && <span className="badge bg-slate-50 text-slate-500 text-xs">{material.topic}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {material.description && (
            <p className="text-sm text-slate-500 mb-4">{material.description}</p>
          )}

          {material.fileUrl ? (
            <div className="border border-slate-200 rounded-xl p-6 text-center bg-slate-50">
              <p className="text-sm text-slate-500 mb-3">📎 {material.fileName || 'Attached file'}</p>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex">
                <Download size={14} /> Download File
              </a>
            </div>
          ) : material.type === 'link' ? (
            <a href={material.content} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex">
              <ExternalLink size={14} /> Open Link
            </a>
          ) : (
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-5">
              {material.content || 'No content available'}
            </div>
          )}

          {material.dueDate && (
            <div className="flex items-center gap-2 mt-4 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              <Calendar size={14} />
              Due: {format(new Date(material.dueDate), 'MMMM d, yyyy')}
            </div>
          )}

          {material.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {material.tags.map((tag, i) => (
                <span key={i} className="badge bg-slate-100 text-slate-500 text-xs">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Posted by {material.teacher?.name}</span>
          <span>{format(new Date(material.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
}