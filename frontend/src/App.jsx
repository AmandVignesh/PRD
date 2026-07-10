import React from 'react';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans antialiased">
      {/* Background Decorative Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        
        {/* Premium Header */}
        <header className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between border-b border-slate-900 pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              {/* Glowing App Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
                Focus
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              What needs your attention today?
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-400 font-semibold bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              Workspace: Active
            </span>
          </div>
        </header>

        {/* Dashboard Main View */}
        <main>
          <Home />
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-900 pt-6 text-center text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Focus Task Manager. Designed for high performance.</p>
          <div className="flex space-x-4">
            <span className="hover:text-slate-400 transition-colors">Press Enter to save</span>
            <span className="text-slate-800">|</span>
            <span className="hover:text-slate-400 transition-colors">Natural Language Capture Enabled</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
