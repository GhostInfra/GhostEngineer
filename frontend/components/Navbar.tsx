import { Ghost, Github, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="navbar-logo">
            <Ghost size={28} style={{ color: 'var(--primary)' }} />
            <span>GhostEngineer</span>
          </div>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="navbar-links">
          <button onClick={() => scrollTo('features')} className="navbar-link">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="navbar-link">How It Works</button>
          <button onClick={() => scrollTo('pricing')} className="navbar-link">Pricing</button>
        </div>

        {/* Right Actions (Desktop) */}
        <div className="navbar-actions">
          <a
            href="https://github.com/Rajkoli145/GhostEngineer"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-link"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Github size={16} />
            Star
          </a>

          {!isLoading && (
            isAuthenticated ? (
              <>
                <span className="navbar-user">
                  <User size={14} />
                  {user?.email?.split('@')[0]}
                </span>
                <button onClick={logout} className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LogOut size={14} />
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="navbar-link">Log In</Link>
                <Link href="/signup" className="navbar-cta">
                  Get Started →
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="navbar-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="navbar-mobile-menu"
          >
            <button onClick={() => scrollTo('features')} className="navbar-link">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="navbar-link">How It Works</button>
            <button onClick={() => scrollTo('pricing')} className="navbar-link">Pricing</button>
            {isAuthenticated ? (
              <button onClick={logout} className="navbar-link">Log Out</button>
            ) : (
              <>
                <Link href="/login" className="navbar-link">Log In</Link>
                <Link href="/signup" className="navbar-cta" style={{ width: '100%', textAlign: 'center' }}>
                  Get Started →
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
