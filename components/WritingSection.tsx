
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Send, Loader2, Edit3 } from 'lucide-react';
import { evaluateEssay } from '../services/aiService';
import { WritingFeedback, IELTSTaskType } from '../types';

const WritingSection: React.FC = () => {
  const [taskType, setTaskType] = useState<IELTSTaskType>(IELTSTaskType.WritingTask2);
  const [question, setQuestion] = useState('');
  const [essay, setEssay] = useState('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (!question.trim() || !essay.trim()) return;
    
    setLoading(true);
    setError(null);
    setFeedback(null);
    
    try {
      const result = await evaluateEssay(question, essay);
      setFeedback(result);
    } catch (err: any) {
      console.error(err);
      setError(`评估失败: ${err.message || '请检查 API Key 或网络连接'}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTaskLabel = (type: IELTSTaskType) => {
    return type === IELTSTaskType.WritingTask1 ? '小作文 (Task 1)' : '大作文 (Task 2)';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">写作评估</h1>
        <p className="text-slate-500 mt-2">基于官方评分标准，获取即时 AI 反馈。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex space-x-4 mb-4">
              {(Object.values(IELTSTaskType) as IELTSTaskType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTaskType(type)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    taskType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getTaskLabel(type)}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">作文题目</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例如：Some people think that social media has a negative impact on society..."
                  className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">你的作文</label>
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="在此处输入你的文章..."
                  className="w-full h-96 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                  <span>字数: {essay.trim().split(/\s+/).filter(w => w.length > 0).length}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <button
                onClick={handleEvaluate}
                disabled={loading || !question || !essay}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg flex items-center justify-center transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI 正在批改...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    获取评估反馈
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          {!feedback && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <Edit3 className="w-16 h-16 mb-4 opacity-20" />
              <p>评估结果将显示在这里</p>
            </div>
          )}

          {loading && (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
               <div className="animate-pulse space-y-4 w-3/4">
                 <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto"></div>
                 <div className="h-4 bg-slate-100 rounded"></div>
                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                 <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="h-24 bg-slate-100 rounded"></div>
                    <div className="h-24 bg-slate-100 rounded"></div>
                    <div className="h-24 bg-slate-100 rounded"></div>
                    <div className="h-24 bg-slate-100 rounded"></div>
                 </div>
               </div>
             </div>
          )}

          {feedback && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">预估总分 (Band Score)</h3>
                  <p className="text-slate-500 text-sm">基于雅思官方标准估算</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-2xl font-bold border ${getScoreColor(feedback.bandScore)}`}>
                  {feedback.bandScore}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CriterionCard title="任务回应 (Task Response)" data={feedback.taskResponse} />
                <CriterionCard title="连贯与衔接 (Coherence)" data={feedback.coherenceCohesion} />
                <CriterionCard title="词汇资源 (Lexical)" data={feedback.lexicalResource} />
                <CriterionCard title="语法多样性 (Grammar)" data={feedback.grammaticalRange} />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  综合建议
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">{feedback.generalAdvice}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">修改片段建议</h4>
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">
                  {feedback.correctedVersion}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CriterionCard: React.FC<{ title: string; data: { score: number; comment: string } }> = ({ title, data }) => (
  <div className="p-4 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
    <div className="flex justify-between items-center mb-2">
      <span className="font-medium text-slate-700 text-sm">{title}</span>
      <span className="text-sm font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">{data.score}</span>
    </div>
    <p className="text-xs text-slate-500 leading-normal">{data.comment}</p>
  </div>
);

export default WritingSection;
