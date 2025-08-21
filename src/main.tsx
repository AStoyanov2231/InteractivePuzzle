import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Disable right-click context menu globally
window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

// Optional: prevent common copy keyboard shortcuts (Ctrl/Cmd+C) except inside inputs/textareas/contenteditable
window.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement | null;
  const isEditable = !!target && (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    (target.getAttribute && target.getAttribute('contenteditable') === 'true') ||
    target.classList.contains('allow-select')
  );
  if (!isEditable && ((event.ctrlKey || event.metaKey) && ['c','x','s','p'].includes(event.key.toLowerCase()))) {
    event.preventDefault();
  }
});