import Head from 'next/head';
import Link from 'next/link';
import RepoInput from '../components/RepoInput';
import ResultView from '../components/ResultView';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AnalyzePage() {
  const [result, set_result] = useState<any>(null);
  const [loading, set_loading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handle_submit = async (url: string) => {
    set_loading(true);
    set_result(null);
    
    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repo_url: url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Failed to analyze repository");
      }

      // Save to analysis history in localStorage
      try {
        const history = JSON.parse(localStorage.getItem('ghost_history') || '[]');
        const entry = {
          repo_url: url,
          repo_name: data.repo_name || url.split('/').pop()?.replace('.git', '') || 'Unknown',
          analyzed_at: new Date().toISOString(),
          file_count: data.file_count || 0,
        };
        // avoid duplicates, keep latest 10
        const filtered = history.filter((h: any) => h.repo_url !== url);
        filtered.unshift(entry);
        localStorage.setItem('ghost_history', JSON.stringify(filtered.slice(0, 10)));
      } catch {}

      set_result(data);
    } catch (error: any) {
      set_result({
        status: "error",
        message: error.message
      });
    } finally {
      set_loading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Analyze — GhostEngineer</title>
        <meta name="description" content="Paste any GitHub repository URL and get instant AI-powered architecture analysis, structure maps, and developer insights." />
      </Head>

      <Navbar />

      <div className="ambient-light" />

      {/* Top gradient bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent)',
        zIndex: 200
      }} />

      <div className="analyze-page">
        <main className="analyze-main">
          <motion.div
            className="analyze-header"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="analyze-title">Analyze a Repository</h2>
            <p className="analyze-subtitle">Paste any public GitHub URL to get started</p>
          </motion.div>

          <RepoInput onSubmit={handle_submit} isLoading={loading} />

          {/* Signup prompt banner (only for non-authenticated users) */}
          {!isAuthenticated && (
            <motion.div
              className="signup-banner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Sparkles size={18} />
              <span>Sign up to save your analysis history and unlock premium features</span>
              <Link href="/signup" className="signup-banner-cta">
                Get Started <ArrowRight size={14} />
              </Link>
            </motion.div>
          )}
          
          <AnimatePresence>
            {result && (
              <div style={{ width: '100%' }}>
                <ResultView result={result} loading={loading} />
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
