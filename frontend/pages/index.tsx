import Head from 'next/head';
import RepoInput from '../components/RepoInput';
import ResultView from '../components/ResultView';
import { useState } from 'react';

export default function Home() {
  const [result, set_result] = useState<string | null>(null);
  const [loading, set_loading] = useState(false);

  const handle_submit = async (url: string) => {
    set_loading(true);
    set_result(null);
    
    // Simulate API call
    setTimeout(() => {
      set_result(JSON.stringify({
        status: "success",
        repo_url: url,
        message: "Repository analysis mock - actual logic coming soon!",
        timestamp: new Date().toISOString()
      }, null, 2));
      set_loading(false);
    }, 2000);
  };

  return (
    <div className="container">
      <Head>
        <title>GhostEngineer | AI Repo Analyzer</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="ambient-light" />

      <header>
        <h1>GhostEngineer</h1>
        <p>Turn any GitHub repository into architectural insights and onboarding documentation in seconds.</p>
      </header>

      <main className="glass-card">
        <RepoInput onSubmit={handle_submit} />
        <ResultView result={result} loading={loading} />
      </main>
    </div>
  );
}
