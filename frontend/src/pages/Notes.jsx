// pages/Notes.jsx
// PDF Notes Upload + AI Notes Summarizer + Export as PDF.

import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  FiUpload, FiFileText, FiDownload, FiTrash2, FiZap, FiX,
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import {
  uploadNoteApi, getNotesApi, getNoteByIdApi, summarizeNoteApi, exportNoteApi, deleteNoteApi,
} from '../api/noteApi';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const loadNotes = async () => {
    const res = await getNotesApi();
    setNotes(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please choose a PDF file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('subject', subject || 'General');

    setUploading(true);
    try {
      await uploadNoteApi(formData);
      toast.success('Note uploaded successfully');
      setTitle('');
      setSubject('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadNotes();
    } finally {
      setUploading(false);
    }
  };

  const openNote = async (note) => {
    const res = await getNoteByIdApi(note._id);
    setSelected(res.data.data);
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await summarizeNoteApi(selected._id);
      setSelected((prev) => ({ ...prev, ...res.data.data }));
      toast.success('Summary generated');
    } finally {
      setSummarizing(false);
    }
  };

  const handleExport = async (noteId, noteTitle) => {
    const res = await exportNoteApi(noteId);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${noteTitle}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    await deleteNoteApi(noteId);
    toast.success('Note deleted');
    if (selected?._id === noteId) setSelected(null);
    loadNotes();
  };

  return (
    <DashboardLayout title="Notes & AI Summarizer">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upload form */}
        <div className="card lg:col-span-1 h-fit">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Upload PDF Notes</h3>
          <form onSubmit={handleUpload} className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input className="input-field" placeholder="e.g. Data Structures Unit 3" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Subject</label>
              <input className="input-field" placeholder="e.g. DSA" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="label">PDF File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-950 dark:file:text-primary-300 hover:file:bg-primary-100"
              />
            </div>
            <button type="submit" disabled={uploading} className="btn-primary w-full">
              {uploading ? <Loader size="sm" /> : <><FiUpload size={16} /> Upload Note</>}
            </button>
          </form>

          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">Your Notes</h3>
          {loading ? (
            <Loader />
          ) : notes.length === 0 ? (
            <p className="text-xs text-gray-400">No notes uploaded yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notes.map((n) => (
                <div
                  key={n._id}
                  onClick={() => openNote(n)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                    selected?._id === n._id
                      ? 'border-primary-500 bg-primary-50 text-gray-800 dark:bg-primary-900 dark:text-white'
                      : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{n.title}</p>
                    <p className="text-xs text-gray-400">{n.subject}</p>
                  </div>
                  <FiTrash2
                    size={14}
                    className="text-gray-300 hover:text-red-500 shrink-0"
                    onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail / summary panel */}
        <div className="card lg:col-span-2">
          {!selected ? (
            <EmptyState icon={FiFileText} title="Select a note" description="Choose a note from the list to view or summarize it." />
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{selected.title}</h3>
                  <p className="text-sm text-gray-400">{selected.subject} • {selected.originalFileName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex gap-2 mb-5">
                <button onClick={handleSummarize} disabled={summarizing} className="btn-primary text-sm">
                  {summarizing ? <Loader size="sm" /> : <><FiZap size={15} /> {selected.summary ? 'Re-summarize' : 'Summarize with AI'}</>}
                </button>
                <button onClick={() => handleExport(selected._id, selected.title)} className="btn-secondary text-sm">
                  <FiDownload size={15} /> Export PDF
                </button>
              </div>

              {selected.summary ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Summary</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selected.summary}</p>
                  </div>
                  {selected.keyPoints?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Key Points</h4>
                      <ul className="space-y-1.5">
                        {selected.keyPoints.map((k, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                            <span className="text-primary-500">•</span> {k}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No summary yet. Click &quot;Summarize with AI&quot; to generate one.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notes;
