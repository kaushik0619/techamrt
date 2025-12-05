import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function submit() {
    const q = (query || '').trim();
    onSearch(q);
    setOpen(false);
  }

  return (
    <div className="relative">
      {open ? (
        <div className="flex items-center gap-2 bg-neutral-800 rounded-full px-3 py-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
            className="bg-transparent outline-none text-sm text-white placeholder-neutral-400"
            placeholder="Search products..."
          />
          <button onClick={submit} className="p-1 text-neutral-300 hover:text-white">
            <Search className="w-4 h-4" />
          </button>
          <button onClick={() => { setOpen(false); setQuery(''); }} className="p-1 text-neutral-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors">
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
