import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Product from './pages/Product';
import About from './pages/About';
import Contact from './pages/Contact';

// Code-split heavy Admin route with React.lazy
const Admin = lazy(() => import('./pages/Admin'));

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-14 animate-pulse" role="status" aria-label="Loading page">
      <div className="h-3.5 w-24 bg-ink/10 rounded mb-3" />
      <div className="h-9 w-64 bg-ink/10 rounded mb-5" />
      <div className="h-px bg-ink/10 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="border border-ink/10 p-2 bg-ivory">
            <div className="aspect-[4/5] bg-ink/10 mb-2" />
            <div className="h-4 w-3/4 bg-ink/10 rounded mb-1" />
            <div className="h-3 w-1/2 bg-ink/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="collections" element={<Collections />} />
        <Route path="product/:code" element={<Product />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route
          path="admin"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Admin />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
