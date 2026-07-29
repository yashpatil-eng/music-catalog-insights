import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import Navbar from './components/Navbar';
import RequireAuth from './components/RequireAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import LibraryPage from './pages/LibraryPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/search"
            element={
              <RequireAuth>
                <SearchPage />
              </RequireAuth>
            }
          />
          <Route
            path="/library"
            element={
              <RequireAuth>
                <LibraryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <AnalyticsPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
