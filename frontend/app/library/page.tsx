'use client';

import { useEffect, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { api, ApiError, LibraryItem } from '@/lib/api';

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
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
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});

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

  async function handleRate(item: LibraryItem, rating: number) {
    try {
      const updated = await api.updateLibraryItem(item.id, { ...item, userRating: rating });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      setError('Could not update rating.');
    }
  }

  async function handleSaveNotes(item: LibraryItem) {
    const notes = notesDraft[item.id] ?? item.userNotes ?? '';
    try {
      const updated = await api.updateLibraryItem(item.id, { ...item, userNotes: notes });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      setError('Could not save notes.');
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteLibraryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError('Could not delete this item.');
    }
  }

  return (
    <RequireAuth>
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
            <a href="/search" className="text-accent hover:underline">
              Search the catalog
            </a>{' '}
            to add your first item.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card flex flex-col gap-4 sm:flex-row">
                {item.artworkUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
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

                  <div className="flex gap-2">
                    <input
                      className="input text-sm"
                      placeholder="Add a note…"
                      defaultValue={item.userNotes ?? ''}
                      onChange={(e) =>
                        setNotesDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      onBlur={() => handleSaveNotes(item)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
