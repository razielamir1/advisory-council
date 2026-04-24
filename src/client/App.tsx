import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DiscussionProvider } from './contexts/DiscussionContext';
import { AuthProvider, RequireAuth } from './components/Auth/AuthProvider';
import Landing from './components/Landing/Landing';
import DomainSelector from './components/DomainSelector/DomainSelector';
import OfficeView from './components/Office/OfficeScene';
import SummaryView from './components/Summary/SummaryView';
import ExecutionPlan from './components/ExecutionPlan/ExecutionPlan';
import LaunchPad from './components/LaunchPad/LaunchPad';

// Admin dashboard is lazy-loaded so recharts + TanStack Table don't hit the main bundle
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));

function AdminChunkFallback() {
  return (
    <div className="min-h-screen bg-gray-950 text-slate-300 flex items-center justify-center">
      טוען דאשבורד...
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DiscussionProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/start" element={<RequireAuth><DomainSelector /></RequireAuth>} />
            <Route path="/office/:id" element={<RequireAuth><OfficeView /></RequireAuth>} />
            <Route path="/summary/:id" element={<RequireAuth><SummaryView /></RequireAuth>} />
            <Route path="/plan/:id" element={<RequireAuth><ExecutionPlan /></RequireAuth>} />
            <Route path="/launch/:id" element={<RequireAuth><LaunchPad /></RequireAuth>} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <Suspense fallback={<AdminChunkFallback />}>
                    <AdminLayout />
                  </Suspense>
                </RequireAuth>
              }
            />
          </Routes>
        </DiscussionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
