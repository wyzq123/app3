import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Edit3, MessageCircle, ArrowRight, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">掌握雅思考试 (IELTS)</h1>
        <p className="text-blue-100 text-lg max-w-2xl">
          使用 AI 评估您的写作，模拟真实的口语面试，并生成无限的阅读练习材料。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          to="/speaking"
          icon={MessageCircle}
          title="口语模拟"
          desc="模拟 Part 1、2、3 考试流程，体验与 AI 考官的实时对话。"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <FeatureCard 
          to="/writing"
          icon={Edit3}
          title="写作评分"
          desc="获取 Task 1 和 Task 2 的即时分数、详细点评及范文修正。"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <FeatureCard 
          to="/reading"
          icon={BookOpen}
          title="阅读生成器"
          desc="生成任意主题的学术阅读文章，并附带针对性的选择题。"
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-slate-400" />
          备考技巧
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">写作技巧</span>
                <p className="text-sm text-slate-700">在开头段务必改写题目（Paraphrase），切勿照抄原题。清晰表达你的立场。</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-green-600 uppercase tracking-wider mb-1">口语技巧</span>
                <p className="text-sm text-slate-700">在 Part 2 中，利用好 1 分钟的准备时间。持续表达直到考官打断你。</p>
            </div>
             <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">阅读技巧</span>
                <p className="text-sm text-slate-700">不要试图读懂全文。先略读标题和问题，然后带着关键词去文中扫读定位。</p>
            </div>
             <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="block text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">通用建议</span>
                <p className="text-sm text-slate-700">贵在坚持。每天专注练习 20 分钟比每周一次突击 5 小时更有效。</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ to: string; icon: any; title: string; desc: string; color: string; bg: string }> = ({ to, icon: Icon, title, desc, color, bg }) => (
  <Link to={to} className="block group">
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className={`w-12 h-12 ${bg} ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{desc}</p>
      <div className="flex items-center text-sm font-medium text-blue-600">
        立即开始 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

export default Dashboard;