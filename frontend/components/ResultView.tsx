import ReactMarkdown from 'react-markdown';
import { Bot, FileText, FolderTree, Copy, Check, BarChart3, Binary, Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// --- File Tree Component ---
interface TreeProps {
  data: any;
  depth?: number;
}

const FileTree = ({ data, depth = 0 }: TreeProps) => {
  const [isOpen, setIsOpen] = useState(depth < 1);
  
  // Handle the case where the data itself is the structure node
  const name = data.name || "Unknown";
  const type = data.type || "file";
  const children = data.children || [];
  const isDirectory = type === 'directory';

  if (!isDirectory) {
    return (
      <div className="tree-item leaf" style={{ paddingLeft: `${depth * 1.5 + 1.5}rem` }}>
        <File size={14} className="text-gray-500" />
        <span className="text-sm text-gray-300 font-mono">{name}</span>
      </div>
    );
  }

  return (
    <div className="tree-node">
      <div 
        className="tree-item branch" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Folder size={14} className="text-primary" fill="currentColor" fillOpacity={0.2} />
        <span className="text-sm font-bold text-white">{name}</span>
      </div>
      
      <AnimatePresence>
        {isOpen && children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {children.map((child: any, index: number) => (
              <FileTree key={`${child.name}-${index}`} data={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ResultViewProps {
  result: any;
  loading: boolean;
}

export default function ResultView({ result: data, loading }: ResultViewProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'structure' | 'details'>('ai');
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bot className="text-primary mb-6" size={64} />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-primary font-bold tracking-widest uppercase text-sm"
        >
          Architecting Insights...
        </motion.p>
      </div>
    );
  }

  if (!data) return null;

  const handleCopy = () => {
    if (data.ai_summary) {
      navigator.clipboard.writeText(data.ai_summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'ai', label: 'AI Insights', icon: Bot },
    { id: 'structure', label: 'Structure', icon: FolderTree },
    { id: 'details', label: 'Stats', icon: BarChart3 },
  ];

  const repoName = data.repo_url ? data.repo_url.split('/').pop().replace('.git', '') : 'Unknown Project';

  return (
    <div className="result-view" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      {data.status === "success" ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Unified Premium Stats Bar */}
          <div className="stats-container glass-card" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1.25rem 2.5rem',
            borderRadius: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
              <div className="stat-group">
                <span className="stat-label">Project</span>
                <span className="stat-value">{repoName}</span>
              </div>
              <div className="stat-group">
                <span className="stat-label">Files</span>
                <span className="stat-value">{data.file_count || 0}</span>
              </div>
              <div className="stat-group">
                <span className="stat-label">Analysis</span>
                <span className="stat-value" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Binary size={16} />
                  {data.file_count > 100 ? 'Deep Scan' : 'Standard'}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div className="badge success">Verified</div>
               <div className="badge primary">AI Optimized</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs-container" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "tab-button",
                  activeTab === tab.id && "active"
                )}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem' }}
              >
                <tab.icon size={18} />
                <span style={{ fontWeight: 600 }}>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="active-tab-indicator" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="relative" style={{ width: '100%' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'ai' && (
                <motion.section
                  key="ai-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="glass-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bot size={20} className="text-primary" />
                        <h3 className="text-lg font-bold">Architectural Intelligence</h3>
                      </div>
                      <button 
                        onClick={handleCopy}
                        className="copy-button"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Summary'}
                      </button>
                    </div>
                    
                    <div className="markdown-content" style={{ padding: '2.5rem', lineHeight: '1.7' }}>
                      {data.ai_summary.startsWith('Error') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          <Bot size={48} style={{ color: '#f87171', opacity: 0.5 }} />
                          <p style={{ color: '#f87171', fontWeight: 600 }}>{data.ai_summary}</p>
                          <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '0.875rem' }}>
                            💡 <b>System Note:</b> You've hit the Gemini Free Tier limit. Wait 60s or switch to a Pro key for massive repo analysis.
                          </div>
                        </div>
                      ) : (
                        <ReactMarkdown>{data.ai_summary}</ReactMarkdown>
                      )}
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === 'structure' && (
                <motion.section
                  key="structure-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="glass-card" style={{ padding: '2rem', minHeight: '500px' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FolderTree size={20} className="text-primary" />
                      <h3 className="text-lg font-bold">Logical Topology</h3>
                    </div>
                    <div className="tree-container">
                      <FileTree data={data.structure} depth={0} />
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === 'details' && (
                <motion.section
                  key="details-tab"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                      <BarChart3 size={20} className="text-primary" />
                      <h3 className="text-lg font-bold">Extraction Meta-Stats</h3>
                    </div>
                    
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                      <div className="space-y-6">
                        <div className="meta-item">
                          <label>Repository Origin</label>
                          <p className="font-mono text-sm">{data.repo_url}</p>
                        </div>
                        <div className="meta-item">
                          <label>Extraction Path</label>
                          <p className="font-mono text-xs text-gray-500">{data.path}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="meta-item">
                          <label>Object Complexity</label>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span className="text-2xl font-bold text-accent">{data.file_count}</span>
                            <span className="text-xs text-gray-500">Atomic Units Extracted</span>
                          </div>
                        </div>
                        <div className="meta-item">
                          <label>Analysis Integrity</label>
                          <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '1rem', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.75rem', fontWeight: 800 }}>
                            PARSING VERIFIED
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="error-message glass-card"
          style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500 rounded-2xl">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Analysis Halted</h2>
              <p className="text-red-400 text-sm">Pipeline encountered a structural error.</p>
            </div>
          </div>
          <div className="p-4 bg-black/40 rounded-xl font-mono text-xs text-red-300">
            {data.message || data.detail || "Ref: 0xGEN_NULL"}
          </div>
        </motion.div>
      )}
    </div>
  );
}
