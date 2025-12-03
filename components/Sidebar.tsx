
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Edit3, MessageCircle, BarChart2, GraduationCap, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';

const Sidebar: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { to: '/', icon: BarChart2, label: '首页' },
    { to: '/speaking', icon: MessageCircle, label: '口语模拟' },
    { to: '/writing', icon: Edit3, label: '写作评估' },
    { to: '/reading', icon: BookOpen, label: '阅读练习' },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-slate-900 text-white flex flex-col items-center md:items-stretch transition-all z-50">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-700">
          <GraduationCap className="w-8 h-8 text-blue-400" />
          <span className="hidden md:block ml-3 font-bold text-xl tracking-tight">雅思<span className="text-blue-400">AI</span></span>
        </div>

        <nav className="flex-1 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-6 h-6 min-w-[24px]" />
              <span className="hidden md:block ml-3 font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-center md:justify-start px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="w-6 h-6 min-w-[24px]" />
            <span className="hidden md:block ml-3 font-medium">模型设置</span>
          </button>
          
          <div className="hidden md:block mt-4 text-xs text-slate-600 text-center">
             支持 Gemini / OpenAI / DeepSeek / 通义千问等
          </div>
        </div>
      </aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Sidebar;
