import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ghost, Clock, GitBranch, Star, Lock,
  Users, GitCompare, FileDown, ArrowRight, Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

interface HistoryEntry {
  repo_url: string;
  repo_name: string;
  analyzed_at: string;
  file_count: number;
}

export default function DashboardPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('ghost_history') || '[]');
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('ghost_history');
    setHistory([]);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    }),
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <Ghost size={48} className="animate-pulse" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const upcomingFeatures = [
    { icon: Users, title: 'Team Collaboration', desc: 'Share insights with your team and collaborate on codebases together.' },
    { icon: GitCompare, title: 'AI Diffs', desc: 'Understand changes between commits with AI-powered diff analysis.' },
    { icon: FileDown, title: 'Export Reports', desc: 'Export architecture docs, onboarding guides, and API references as PDF.' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard — GhostEngineer</title>
      </Head>

      <Navbar />

      <div className="dashboard-page">
        <div className="ambient-light" />

        {/* Welcome Header */}
        <motion.section
          className="dashboard-welcome"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="dashboard-greeting">
            Welcome back, <span className="gradient-text">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="dashboard-subtitle">Your personal GhostEngineer workspace</p>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          className="dashboard-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/analyze" className="dashboard-action-btn btn-primary">
            <Ghost size={18} />
            Analyze a Repo
            <ArrowRight size={16} />
          </Link>
        </motion.section>

        {/* Recent Analyses */}
        <motion.section
          className="dashboard-section"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="dashboard-section-header">
            <h2><Clock size={20} /> Recent Analyses</h2>
            {history.length > 0 && (
              <button onClick={clearHistory} className="dashboard-clear-btn">
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="dashboard-empty">
              <Ghost size={32} style={{ opacity: 0.3 }} />
              <p>No analyses yet. <Link href="/analyze" style={{ color: 'var(--primary)' }}>Analyze your first repo →</Link></p>
            </div>
          ) : (
            <div className="dashboard-history-list">
              {history.map((entry, i) => (
                <motion.div
                  key={entry.repo_url}
                  className="dashboard-history-item"
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                >
                  <div className="history-item-left">
                    <GitBranch size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div>
                      <span className="history-repo-name">{entry.repo_name}</span>
                      <span className="history-meta">
                        {entry.file_count > 0 && `${entry.file_count} files · `}
                        {new Date(entry.analyzed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link href="/analyze" className="history-analyze-btn">
                    Re-analyze <ArrowRight size={12} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Saved Repos */}
        <motion.section
          className="dashboard-section"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="dashboard-section-header">
            <h2><Star size={20} /> Saved Repositories</h2>
          </div>
          <div className="dashboard-empty">
            <Star size={32} style={{ opacity: 0.3 }} />
            <p>Saved repos will appear here in a future update.</p>
          </div>
        </motion.section>

        {/* Upcoming Features */}
        <motion.section
          className="dashboard-section"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="dashboard-section-header">
            <h2><Lock size={20} /> Upcoming Features</h2>
          </div>
          <div className="dashboard-features-grid">
            {upcomingFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="dashboard-locked-card"
                custom={i + 3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <div className="locked-badge"><Lock size={12} /> Coming Soon</div>
                <feat.icon size={28} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </>
  );
}
