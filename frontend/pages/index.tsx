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
    
    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repo_url: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze repository");
      }

      const data = await response.json();
      set_result(JSON.stringify(data, null, 2));
    } catch (error: any) {
      set_result(`Error: ${error.message}`);
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>GhostEngineer | AI Repo Analyzer</title>
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
