'use client';

import { Search, Zap, Loader2 } from 'lucide-react';

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function Header({ query, onQueryChange, onSearch, loading }: Props) {
  return (
    <header className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 shadow-lg z-20 flex-none">
      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-white flex-none">
          <div className="bg-white/20 rounded-lg p-1.5">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">HireWire</span>
        </div>

        <form
          className="flex flex-1 max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
        >
          <div className="flex flex-1 bg-white/10 rounded-l-lg border border-white/20 overflow-hidden focus-within:bg-white/20 focus-within:border-white/40 transition-all">
            <div className="flex items-center pl-3 text-white/70">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Job title, keywords, skills..."
              className="flex-1 bg-transparent text-white placeholder-white/50 px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-5 py-2.5 rounded-r-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>
    </header>
  );
}
