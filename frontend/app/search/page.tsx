'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import RequireAuth from '@/components/RequireAuth';
import { api, ApiError, ItunesResult } from '@/lib/api';

function AlbumCard({ result, onSave, saved, saving }: {
  result: ItunesResult;
  onSave: () => void;
  saved: boolean;
  saving: boolean;
}) {
  return (
    <div className="card flex flex-col gap-3">
      {result.artworkUrl100 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result.artworkUrl100.replace('100x100', '300x300')}
          alt={result.collectionName || result.trackName || 'Artwork'}
          className="aspect-square w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-white/5 text-4xl">
          🎵
        </div>
      )}
      <div>
        <h3 className="line-clamp-1 font-medium">{result.collectionName || result.trackName || result.artistName}</h3>
        <p className="line-clamp-1 text-sm text-slate-400">{result.artistName}</p>
        <p className="mt-1 text-xs text-slate-500">
          {result.primaryGenreName || 'Unknown genre'}
          {result.releaseDate ? ` · ${new Date(result.releaseDate).getFullYear()}` : ''}
        </p>
      </div>
      <button
        onClick={onSave}
        disabled={saved || saving}
        className={saved ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save to library'}
      </button>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('album');
  const [results, setResults] = useState<ItunesResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  const runSearch = useCallback(async (q: string, t: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.search(q, t, 24);
      setResults(res.results || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useDebouncedCallback((q: string, t: string) => runSearch(q, t), 400);

  useEffect(() => {
    debouncedSearch(query, type);
  }, [query, type, debouncedSearch]);

  async function handleSave(result: ItunesResult) {
    const catalogId = result.collectionId || result.trackId || result.artistId;
    if (!catalogId) return;
    setSavingId(catalogId);
    try {
      await api.addToLibrary({
        appleCatalogId: catalogId,
        title: result.collectionName || result.trackName || result.artistName,
        artistName: result.artistName,
        genre: result.primaryGenreName ?? null,
        releaseDate: result.releaseDate ? result.releaseDate.slice(0, 10) : null,
        trackCount: result.trackCount ?? null,
        artworkUrl: result.artworkUrl100 ?? null,
      });
      setSavedIds((prev) => new Set(prev).add(catalogId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save this item.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Search the catalog</h1>
          <p className="mt-1 text-sm text-slate-400">
            Powered by the iTunes Search API. Find albums, songs, or artists and save them to your library.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="input flex-1"
            placeholder="Search for an artist, album, or song…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="input sm:w-40">
            <option value="album">Albums</option>
            <option value="song">Songs</option>
            <option value="artist">Artists</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {isLoading && <p className="text-sm text-slate-400">Searching…</p>}

        {!isLoading && query && results.length === 0 && !error && (
          <p className="text-sm text-slate-400">No results found. Try a different search.</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((r) => {
            const catalogId = r.collectionId || r.trackId || r.artistId || 0;
            return (
              <AlbumCard
                key={catalogId}
                result={r}
                onSave={() => handleSave(r)}
                saved={savedIds.has(catalogId)}
                saving={savingId === catalogId}
              />
            );
          })}
        </div>
      </div>
    </RequireAuth>
  );
}
