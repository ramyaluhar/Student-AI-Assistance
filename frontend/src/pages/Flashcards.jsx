// pages/Flashcards.jsx
// AI Flashcard Generator with an interactive flip-card study viewer.

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiZap, FiLayers, FiTrash2, FiChevronLeft, FiChevronRight, FiRotateCw } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { generateFlashcardsApi, getDecksApi, getDeckByIdApi, deleteDeckApi } from '../api/flashcardApi';
import { getNotesApi } from '../api/noteApi';

const Flashcards = () => {
  const [decks, setDecks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ source: 'topic', noteId: '', topic: '', count: 10 });

  const loadData = async () => {
    const [deckRes, noteRes] = await Promise.all([getDecksApi(), getNotesApi()]);
    setDecks(deckRes.data.data);
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
      const payload = {
        count: Number(form.count),
        ...(form.source === 'note' ? { noteId: form.noteId } : { topic: form.topic }),
      };
      const res = await generateFlashcardsApi(payload);
      toast.success('Flashcards generated!');
      setActiveDeck(res.data.data);
      setCardIdx(0);
      setFlipped(false);
      loadData();
    } finally {
      setGenerating(false);
    }
  };

  const openDeck = async (deckId) => {
    const res = await getDeckByIdApi(deckId);
    setActiveDeck(res.data.data);
    setCardIdx(0);
    setFlipped(false);
  };

  const handleDelete = async (deckId) => {
    if (!window.confirm('Delete this flashcard deck?')) return;
    await deleteDeckApi(deckId);
    toast.success('Deck deleted');
    if (activeDeck?._id === deckId) setActiveDeck(null);
    loadData();
  };

  const nextCard = () => {
    setFlipped(false);
    setCardIdx((i) => Math.min(i + 1, activeDeck.cards.length - 1));
  };
  const prevCard = () => {
    setFlipped(false);
    setCardIdx((i) => Math.max(i - 1, 0));
  };

  return (
    <DashboardLayout title="Flashcard Generator">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-1 h-fit">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Generate Flashcards</h3>
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
                <input className="input-field" placeholder="e.g. Newton's Laws of Motion" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
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

            <div>
              <label className="label"># Cards</label>
              <select className="input-field" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })}>
                {[5, 10, 15, 20].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full">
              {generating ? <Loader size="sm" label="Generating..." /> : <><FiZap size={16} /> Generate Deck</>}
            </button>
          </form>

          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mt-6 mb-3">Your Decks</h3>
          {loading ? <Loader /> : decks.length === 0 ? (
            <p className="text-xs text-gray-400">No decks yet.</p>
          ) : (
            <div className="space-y-2">
             {decks.map((d) => {
  const isActive = activeDeck?._id === d._id;

  return (
    <div
      key={d._id}
      onClick={() => openDeck(d._id)}
      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
        isActive
          ? 'border-primary-500 bg-primary-600 text-white'
          : 'border-gray-100 dark:border-gray-800 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive
              ? 'text-white'
              : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {d.title}
        </p>

        <p
          className={`text-xs ${
            isActive
              ? 'text-primary-100'
              : 'text-gray-400'
          }`}
        >
          {d.cards.length} cards
        </p>
      </div>

      <FiTrash2
        size={14}
        className={`shrink-0 ml-2 ${
          isActive
            ? 'text-primary-100 hover:text-white'
            : 'text-gray-300 hover:text-red-500'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(d._id);
        }}
      />
    </div>
  );
})}
            </div>
          )}
        </div>

        <div className="card lg:col-span-2 flex items-center justify-center min-h-[420px]">
          {!activeDeck ? (
            <EmptyState icon={FiLayers} title="No deck selected" description="Generate or select a flashcard deck to start studying." />
          ) : (
            <div className="w-full max-w-md">
              <p className="text-center text-sm text-gray-400 mb-4">
                Card {cardIdx + 1} of {activeDeck.cards.length}
              </p>
              <div
                onClick={() => setFlipped((f) => !f)}
                className="cursor-pointer h-64 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center p-6 text-center shadow-soft select-none"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-70 mb-2 flex items-center justify-center gap-1">
                    <FiRotateCw size={12} /> {flipped ? 'Answer' : 'Question'} (tap to flip)
                  </p>
                  <p className="text-lg font-semibold leading-snug">
                    {flipped ? activeDeck.cards[cardIdx].back : activeDeck.cards[cardIdx].front}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button onClick={prevCard} disabled={cardIdx === 0} className="btn-secondary text-sm disabled:opacity-40">
                  <FiChevronLeft size={16} /> Prev
                </button>
                <button onClick={nextCard} disabled={cardIdx === activeDeck.cards.length - 1} className="btn-secondary text-sm disabled:opacity-40">
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Flashcards;
