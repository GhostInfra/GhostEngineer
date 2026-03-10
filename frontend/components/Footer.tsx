import { Ghost, Github, FileText, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Ghost size={24} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>GhostEngineer</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#555', maxWidth: '280px', lineHeight: '1.6' }}>
            Architectural intelligence for your codebase. Part of the GhostStack ecosystem.
          </p>
        </div>

        <div className="footer-links-group">
          <h4>Product</h4>
          <Link href="/analyze">Analyzer</Link>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </div>

        <div className="footer-links-group">
          <h4>Resources</h4>
          <a href="https://github.com/Rajkoli145/GhostEngineer" target="_blank" rel="noopener noreferrer">
            <Github size={14} /> GitHub
          </a>
          <a href="https://github.com/Rajkoli145/GhostEngineer/blob/main/docs/api.md" target="_blank" rel="noopener noreferrer">
            <FileText size={14} /> Documentation
          </a>
        </div>

        <div className="footer-links-group">
          <h4>Connect</h4>
          <a href="mailto:rajkoli145@gmail.com">
            <Mail size={14} /> Contact
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} GhostStack. All rights reserved.</p>
      </div>
    </footer>
  );
}
