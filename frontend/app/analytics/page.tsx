'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import RequireAuth from '@/components/RequireAuth';
import { api, ApiError, AnalyticsResponse, AiInsightResponse } from '@/lib/api';

const COLORS = ['#7c5cff', '#3ddc97', '#ff8a5c', '#5cc8ff', '#ffd45c', '#ff5c8a', '#9d5cff', '#5cffcf'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="mb-4 font-medium text-slate-200">{title}</h3>
      <div className="h-72 w-full">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-full items-center justify-center text-sm text-slate-500">Not enough data yet</div>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [insight, setInsight] = useState<AiInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not load analytics.');
      } finally {
        setIsLoading(false);
      }
    })();

    (async () => {
      try {
        const data = await api.getAiInsights();
        setInsight(data);
      } catch {
        // AI insights are a bonus feature - fail silently without blocking the rest of the dashboard
      } finally {
        setIsInsightLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <RequireAuth>
        <p className="text-sm text-slate-400">Loading analytics…</p>
      </RequireAuth>
    );
  }

  if (error || !analytics) {
    return (
      <RequireAuth>
        <p className="text-sm text-red-400">{error || 'No analytics available.'}</p>
      </RequireAuth>
    );
  }

  const genreData = Object.entries(analytics.genreDistribution).map(([name, value]) => ({ name, value }));
  const artistData = Object.entries(analytics.topArtists)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const yearData = Object.entries(analytics.releasesByYear)
    .map(([year, value]) => ({ year, value }))
    .sort((a, b) => Number(a.year) - Number(b.year));
  const histogramData = analytics.trackCountHistogramBuckets.slice(0, -1).map((edge, i) => ({
    range: `${edge}-${analytics.trackCountHistogramBuckets[i + 1]}`,
    count: analytics.trackCountHistogramCounts[i],
  }));

  return (
    <RequireAuth>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">
            {analytics.totalItems} items · average rating{' '}
            {analytics.averageRating ? analytics.averageRating.toFixed(1) : '—'} / 5
          </p>
        </div>

        <div className="card border-accent/30">
          <h3 className="mb-2 flex items-center gap-2 font-medium text-slate-200">
            ✨ AI Insights
            {insight && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">
                {insight.source === 'llm' ? 'LLM-generated' : 'Rule-based'}
              </span>
            )}
          </h3>
          {isInsightLoading ? (
            <p className="text-sm text-slate-400">Analyzing your library…</p>
          ) : insight ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-300">{insight.summary}</p>
              {insight.recommendations.length > 0 && (
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">You might also like</p>
                  <ul className="list-inside list-disc text-sm text-slate-300">
                    {insight.recommendations.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Insights unavailable right now.</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Genre distribution (Bar)">
            {genreData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer>
                <BarChart data={genreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1b1d29', border: '1px solid #ffffff22' }} />
                  <Bar dataKey="value" fill="#7c5cff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Genre share (Pie / Donut)">
            {genreData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genreData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {genreData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1b1d29', border: '1px solid #ffffff22' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Releases by year (Line)">
            {yearData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer>
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1b1d29', border: '1px solid #ffffff22' }} />
                  <Line type="monotone" dataKey="value" stroke="#3ddc97" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Track count distribution (Histogram)">
            {histogramData.every((d) => d.count === 0) ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer>
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1b1d29', border: '1px solid #ffffff22' }} />
                  <Bar dataKey="count" fill="#ff8a5c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Top artists (Horizontal Bar)">
            {artistData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer>
                <BarChart data={artistData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={100} />
                  <Tooltip contentStyle={{ background: '#1b1d29', border: '1px solid #ffffff22' }} />
                  <Bar dataKey="value" fill="#5cc8ff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>
    </RequireAuth>
  );
}
