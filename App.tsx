import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import ReadingSection from './components/ReadingSection';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-20 md:ml-64 p-6 md:p-8 transition-all">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/writing" element={<WritingSection />} />
            <Route path="/speaking" element={<SpeakingSection />} />
            <Route path="/reading" element={<ReadingSection />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
