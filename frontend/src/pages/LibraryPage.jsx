import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`text-lg leading-none ${value && n <= value ? 'text-amber-400' : 'text-slate-600'}`}
          aria-label={`Rate ${n} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notesDraft, setNotesDraft] = useState({});

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getLibrary();
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your library.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRate(item, rating) {
    try {
      const updated = await api.updateLibraryItem(item.id, { ...item, userRating: rating });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      setError('Could not update rating.');
    }
  }

  async function handleSaveNotes(item) {
    const newNote = (notesDraft[item.id] ?? '').trim();
    if (!newNote) {
      return;
    }

    const existingNotes = item.userNotes?.trim();
    const notes = existingNotes
      ? `${existingNotes}\n\n• ${newNote}`
      : `• ${newNote}`;

    try {
      const updated = await api.updateLibraryItem(item.id, { ...item, userNotes: notes });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      setNotesDraft((prev) => ({ ...prev, [item.id]: '' }));
    } catch {
      setError('Could not save notes.');
    }
  }

  async function handleDeleteNote(item, noteIndex) {
    const notes = item.userNotes?.split('\n\n') ?? [];
    const updatedNotes = notes.filter((_, index) => index !== noteIndex);
    const notesText = updatedNotes.join('\n\n');

    try {
      const updated = await api.updateLibraryItem(item.id, { ...item, userNotes: notesText });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      setError('Could not delete note.');
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteLibraryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError('Could not delete this item.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Your library</h1>
        <p className="mt-1 text-sm text-slate-400">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading your library…</p>
      ) : items.length === 0 ? (
        <div className="card text-center text-slate-400">
          Your library is empty.{' '}
          <Link to="/search" className="text-accent hover:underline">
            Search the catalog
          </Link>{' '}
          to add your first item.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col gap-4 sm:flex-row">
              {item.artworkUrl ? (
                <img
                  src={item.artworkUrl.replace('100x100', '150x150')}
                  alt={item.title}
                  className="h-24 w-24 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-white/5 text-3xl">
                  🎵
                </div>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.artistName}</p>
                    <p className="text-xs text-slate-500">
                      {item.genre || 'Unknown genre'}
                      {item.releaseDate ? ` · ${new Date(item.releaseDate).getFullYear()}` : ''}
                      {item.trackCount ? ` · ${item.trackCount} tracks` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <StarRating value={item.userRating} onChange={(v) => handleRate(item, v)} />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white">Notes</p>
                    {item.userNotes ? (
                      item.userNotes.split('\n\n').map((note, index) => (
                        <div key={index} className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                          <div className="flex items-start justify-between gap-3">
                            <p className="whitespace-pre-wrap">{note}</p>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(item, index)}
                              className="text-xs text-red-400 hover:text-red-300"
                              aria-label="Delete note"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="mt-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-3 text-sm text-slate-500">
                        No notes yet. Add one below.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <textarea
                      rows={3}
                      className="input text-sm resize-none"
                      placeholder="Write a new note…"
                      value={notesDraft[item.id] ?? ''}
                      onChange={(e) =>
                        setNotesDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(item)}
                      className="btn-secondary w-full text-sm"
                    >
                      Save note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
