import { Github, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface RepoInputProps {
  onSubmit: (repoUrl: string) => void;
  isLoading: boolean;
}

export default function RepoInput({ onSubmit, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (url && !isLoading) onSubmit(url);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '672px', width: '100%', position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ display: 'block', width: '100%' }}>
        <label htmlFor="repoUrl" style={{ display: 'none' }}>GitHub Repository URL</label>
        
        <div style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            left: '1.25rem', 
            color: '#9ca3af', 
            display: 'flex', 
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Github size={20} />
          </div>
          
          <input
            id="repoUrl"
            name="repoUrl"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/Rajkoli145/FreelancerFlow.git"
            style={{ 
              width: '100%', 
              background: 'transparent', 
              border: 'none', 
              padding: '1.25rem 1rem 1.25rem 3.5rem', 
              paddingRight: '9rem',
              color: '#fff', 
              outline: 'none',
              fontSize: '1rem'
            }}
            required
            disabled={isLoading}
          />

          <div style={{ 
            position: 'absolute', 
            right: '0.5rem', 
            top: '0.5rem', 
            bottom: '0.5rem',
            display: 'flex'
          }}>
            <button
              type="submit"
              disabled={isLoading || !url}
              className="analyze-button"
              style={{ padding: '0 1.5rem', height: '100%' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="loader-icon" />
                  <span>Working...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4" style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <span className="status-indicator" />
          Ready for architecture extraction
        </p>
      </form>
    </div>
  );
}
