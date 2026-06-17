import React from 'react';
import { FileText, File, Video, Link as LinkIcon, ClipboardList, Download, Eye, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const typeConfig = {
  notes: { icon: FileText, color: 'bg-blue-100 text-blue-600' },
  pdf: { icon: File, color: 'bg-red-100 text-red-600' },
  assignment: { icon: ClipboardList, color: 'bg-amber-100 text-amber-600' },
  video: { icon: Video, color: 'bg-violet-100 text-violet-600' },
  link: { icon: LinkIcon, color: 'bg-cyan-100 text-cyan-600' },
  other: { icon: File, color: 'bg-slate-100 text-slate-600' },
};

export default function MaterialCard({ material, onView, onDelete, canDelete = false }) {
  const config = typeConfig[material.type] || typeConfig.other;
  const Icon = config.icon;

  return (
    <div className="card-hover p-5">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 text-sm leading-tight">{material.title}</h3>
            {canDelete && (
              <button onClick={() => onDelete?.(material._id)} className="text-slate-300 hover:text-red-500 flex-shrink-0">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{material.description}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="badge bg-slate-50 text-slate-500 text-xs">{material.subject}</span>
            {material.topic && <span className="badge bg-primary-50 text-primary-600 text-xs">{material.topic}</span>}
            <span className="badge bg-slate-50 text-slate-400 text-xs capitalize">{material.type}</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Eye size={11} /> {material.views || 0}</span>
              {material.fileUrl && <span className="flex items-center gap-1"><Download size={11} /> {material.downloads || 0}</span>}
              <span>{format(new Date(material.createdAt), 'MMM d')}</span>
            </div>
            <button onClick={() => onView?.(material)} className="text-primary-600 text-xs font-semibold hover:text-primary-700">
              View →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}