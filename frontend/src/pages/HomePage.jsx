import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Secure music library',
    description: 'JWT auth, user-specific library storage, and safe notes handling for personal music collections.',
  },
  {
    title: 'Insightful analytics',
    description: 'Genre distribution, artist trends, release-year charts, and track-count summaries in one dashboard.',
  },
  {
    title: 'AI-powered recommendations',
    description: 'Optional LLM summaries plus rule-based recommendations to help users discover albums they’ll love.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8 rounded-3xl border border-white/10 bg-slate-950/70 p-10 shadow-xl shadow-slate-950/20">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Music Catalog Insights</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Build your personal music library, then understand what it says about your taste.
            </h1>
            <p className="text-lg leading-8 text-slate-300">
              Search the iTunes catalog, save albums, leave notes, and explore charts that reveal your favorite genres, artists, and listening eras.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-5">
                <h2 className="text-base font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-xl shadow-slate-950/20">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Why this app</p>
            <h2 className="text-2xl font-semibold text-white">A polished take-home project for recruiters</h2>
            <p className="text-sm leading-6 text-slate-400">
              Showcases end-to-end development with secure auth, data persistence, responsive UI, analytics, and optional AI features.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/login" className="btn-primary w-full text-center">
              Log in
            </Link>
            <Link to="/register" className="btn-secondary w-full text-center">
              Sign up
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">Core strengths</p>
            <ul className="mt-4 space-y-2">
              <li>Responsive mobile-first design</li>
              <li>Clean full-stack architecture</li>
              <li>User-specific library + notes</li>
              <li>Interactive analytics dashboard</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Built for recruiters</p>
          <h3 className="mt-4 text-xl font-semibold text-white">A strong take-home showcase</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Demonstrates practical skills in Java, Spring Boot, React, Tailwind, API integration, and product-minded UI design.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Responsive UI</p>
          <h3 className="mt-4 text-xl font-semibold text-white">Looks great on any device</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The app scales cleanly from mobile screens to desktop, with touch-friendly form controls and chart layouts.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-xl shadow-slate-950/20">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Professional polish</p>
          <h3 className="mt-4 text-xl font-semibold text-white">Ready for presentation</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Clean UI, consistent components, good dev experience, and key project documentation make it recruiter-friendly.
          </p>
        </div>
      </section>
    </div>
  );
}
