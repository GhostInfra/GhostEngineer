import Head from 'next/head';
import RepoInput from '../components/RepoInput';
import ResultView from '../components/ResultView';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost } from 'lucide-react';

export default function Home() {
  const [result, set_result] = useState<any>(null);
  const [loading, set_loading] = useState(false);

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
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Head>
        <title>GhostEngineer | AI Repo Analyzer</title>
      </Head>

      <div className="ambient-light" />
      
      {/* Decorative top gradient */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
        opacity: 0.5,
        zIndex: 100
      }} />

      <header style={{ paddingTop: '5rem', paddingBottom: '3rem', width: '100%' }}>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}
        >
          <Ghost size={56} style={{ color: 'var(--primary)' }} className="animate-pulse" />
          <span className="gradient-text">GhostEngineer</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ textAlign: 'center', margin: '0 auto', maxWidth: '600px', color: '#888', fontSize: '1.2rem', lineHeight: '1.6' }}
        >
          Architectural intelligence for your codebase. Summarize repos, map structures, and generate developer guides instantly.
        </motion.p>
      </header>

      <main style={{ width: '100%', paddingBottom: '96px', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        <RepoInput onSubmit={handle_submit} isLoading={loading} />
        
        <AnimatePresence>
          {result && (
            <div style={{ width: '100%' }}>
              <ResultView result={result} loading={loading} />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
