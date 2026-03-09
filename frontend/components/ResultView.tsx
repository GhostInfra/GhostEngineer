import ReactMarkdown from 'react-markdown';
import { Bot, FileText, FolderTree } from 'lucide-react';

interface ResultViewProps {
  result: string | null;
  loading: boolean;
}

export default function ResultView({ result, loading }: ResultViewProps) {
  if (loading) {
    return (
      <div className="result-view loading">
        <Bot className="animate-bounce mb-4 mx-auto" size={48} />
        <p>Analyzing repository architecture...</p>
      </div>
    );
  }

  if (!result) return null;

  let data: any;
  try {
    data = JSON.parse(result);
  } catch (e) {
    return (
      <div className="result-view error">
        <p className="text-red-500 font-bold">Failed to parse analysis result.</p>
        <pre>{result}</pre>
      </div>
    );
  }

  return (
    <div className="result-view animate-in fade-in duration-700">
      {data.status === "success" ? (
        <div className="space-y-8">
          <section className="ai-summary">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Bot size={24} />
              <h2 className="text-xl font-bold uppercase tracking-wider">AI Architectural Insight</h2>
            </div>
            <div className={`markdown-content glass-card p-6 border-l-4 ${data.ai_summary.startsWith('Error') ? 'border-l-red-500 bg-red-500/5' : 'border-l-primary'}`}>
              {data.ai_summary.startsWith('Error') ? (
                <div className="flex flex-col gap-2">
                  <p className="font-semibold text-red-400">Analysis Halted</p>
                  <p className="text-sm opacity-80">{data.ai_summary}</p>
                  <p className="text-xs text-gray-500 mt-2 italic">Tip: Check your .env configuration and API limits.</p>
                </div>
              ) : (
                <ReactMarkdown>{data.ai_summary}</ReactMarkdown>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="repo-structure">
              <div className="flex items-center gap-2 mb-4 text-accent">
                <FolderTree size={20} />
                <h3 className="text-sm font-semibold uppercase">Project Structure</h3>
              </div>
              <pre className="text-xs h-[400px] overflow-auto">
                {JSON.stringify(data.structure, null, 2)}
              </pre>
            </section>

            <section className="metadata">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <FileText size={20} />
                <h3 className="text-sm font-semibold uppercase">Analysis Details</h3>
              </div>
              <div className="glass-card p-4 space-y-2 text-sm text-gray-400">
                <p><span className="text-white">URL:</span> {data.repo_url}</p>
                <p><span className="text-white">Files Processed:</span> {data.file_count}</p>
                <p><span className="text-white">Temp Path:</span> {data.path}</p>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="error-message p-6 border border-red-500/50 bg-red-500/10 rounded-xl text-red-400">
          <h2 className="font-bold mb-2">Analysis Failed</h2>
          <p>{data.message || data.detail || "An unexpected error occurred."}</p>
        </div>
      )}
    </div>
  );
}
