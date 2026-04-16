import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { type Brand } from './theme';
import { setBrandPalettes, type ServerBrandConfig } from './components/mockups/_shared';
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
  brands: ServerBrandConfig[];
}

export const BrandContext = createContext<BrandCtx>({ brand: 'default', setBrand: () => {}, brands: [] });
export const useBrand = () => useContext(BrandContext);

function BrandToggle() {
  const { brand, setBrand, brands } = useBrand();
  // Single-brand setups don't need a toggle.
  if (brands.length <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 2, padding: '3px 4px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
      {brands.map(b => (
        <button
          key={b.id}
          onClick={() => setBrand(b.id)}
          title={b.label || b.id}
          style={{
            padding: '4px 14px', border: 'none', borderRadius: 6, cursor: 'pointer',
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            background: brand === b.id ? (b.color || '#6366f1') : 'transparent',
            color: brand === b.id ? '#fff' : 'rgba(255,255,255,0.25)',
            transition: 'all 200ms ease',
          }}
        >
          {(b.label || b.id).slice(0, 8)}
        </button>
      ))}
    </div>
  );
}

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
      <BrandToggle />
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
  const [brands, setBrands] = useState<ServerBrandConfig[]>([]);

  // Hydrate brand palette + toggle from server config on first paint.
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(cfg => {
        const list: ServerBrandConfig[] = Array.isArray(cfg.brands) ? cfg.brands : [];
        setBrandPalettes(list);
        setBrands(list);
        if (list.length > 0 && !list.some(b => b.id === 'default')) {
          setBrand(list[0].id);
        }
      })
      .catch(err => console.warn('Failed to load /api/config; using defaults:', err));
  }, []);

  return (
    <BrandContext.Provider value={{ brand, setBrand, brands }}>
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
