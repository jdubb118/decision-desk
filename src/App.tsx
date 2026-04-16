import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
// useLocation still used by AnimatedRoutes
import { motion, AnimatePresence } from 'framer-motion';
import { type Brand } from './theme';
import './index.css';

import DecisionDesk from './pages/DecisionDesk';
import IntelligencePage from './pages/IntelligencePage';
import CalendarPage from './pages/CalendarPage';
import { ApiDocsButton } from './components/ApiDocsPanel';

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '6px 14px', borderRadius: 6, textDecoration: 'none',
  fontSize: 13, fontWeight: 500,
  color: isActive ? '#fff' : 'rgba(255,255,255,0.3)',
  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
  transition: 'all 200ms ease',
});

interface BrandCtx {
  brand: Brand;
  setBrand: (b: Brand) => void;
}

export const BrandContext = createContext<BrandCtx>({ brand: 'default', setBrand: () => {} });
export const useBrand = () => useContext(BrandContext);

// Brand toggle is hidden in Day 1 — the OSS default is single-brand.
// Multi-brand UI returns in Day 2 once the server-side config layer lands.

function Nav() {
  const links = [
    { to: '/', label: 'Decisions', end: true },
    { to: '/calendar', label: 'Calendar' },
    { to: '/intelligence', label: 'Intelligence' },
  ];
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px',
      background: '#08080f', borderBottom: '1px solid rgba(255,255,255,0.06)',
      fontFamily: "'DM Sans', sans-serif",
      height: 52,
    }}>
      <span style={{
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 800,
        fontSize: 17,
        color: '#fff',
        marginRight: 20,
        letterSpacing: '-0.02em',
      }}>
        Decision Desk
      </span>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.end} style={navLinkStyle}>
          {l.label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        <Routes location={location}>
          <Route path="/" element={<DecisionDesk />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [brand, setBrand] = useState<Brand>('default');
  return (
    <BrandContext.Provider value={{ brand, setBrand }}>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#0a0a14', color: '#e0e0e0' }}>
          <Nav />
          <AnimatedRoutes />
          <ApiDocsButton />
        </div>
      </BrowserRouter>
    </BrandContext.Provider>
  );
}
